import os
import streamlit as st
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import langchain
import time

# Load your custom fine-tuned model
MODEL_PATH = "./Llama-3-8B-BCITchatBot-finetune-verison1"

# Verify the model path and files
assert os.path.isdir(MODEL_PATH), f"Directory not found: {MODEL_PATH}"
required_files = ['config.json', 'pytorch_model-00001-of-00002.bin', 'pytorch_model-00002-of-00002.bin', 'tokenizer_config.json']
for file_name in required_files:
    file_path = os.path.join(MODEL_PATH, file_name)
    assert os.path.isfile(file_path), f"Required file not found: {file_path}"

# Initialize device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
num_gpus = torch.cuda.device_count()
print(f"Using {num_gpus} GPU(s): {[torch.cuda.get_device_name(i) for i in range(num_gpus)]}")

# Load model and tokenizer only once
@st.cache_resource
def load_model_and_tokenizer():
    print("Loading model with mixed precision...")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH, 
        device_map='auto',
        torch_dtype=torch.float16,  # Use float16 for mixed precision
        load_in_8bit=True           # Load model in 8-bit precision to save memory
    )

    if num_gpus > 1:
        model = torch.nn.DataParallel(model)
    print("Model loaded successfully.")

    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    print("Tokenizer loaded successfully.")
    
    return model, tokenizer

model, tokenizer = load_model_and_tokenizer()

# System prompt used within the codebase
SYSTEM_PROMPT = """
You are BCIT's university chatbot, designed to assist students, faculty, and visitors with information about the university. You should provide clear, concise, and helpful answers to any questions related to BCIT, including academic programs, campus facilities, events, and more.

When responding to a question, follow these guidelines:
1. Answer the question directly and clearly.
2. Provide a URL where the user can find more information.
3. Offer navigation instructions on how to reach the specific information starting from the BCIT main website.

Use this template for your responses:
- Direct answer to the question.
- URL for more information: [URL]
- Navigation instructions: "To find more information, start at the BCIT main page (https://www.bcit.ca). From there, navigate to [specific page] by [detailed navigation steps]."

Always be polite, professional, and eager to help.
"""

# Function to generate response (Modified for longer output)
def generate_response(new_user_input):
    # print("Starting response generation workflow...")
    
    # Preprocessing
    start_preprocessing = time.time()
    # print("Preprocessing step: Encoding input text...")
    input_text = SYSTEM_PROMPT + f"\nUser: {new_user_input}\nChatbot:"
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)
    end_preprocessing = time.time()
    preprocessing_time = end_preprocessing - start_preprocessing
    print(f"Preprocessing completed in {preprocessing_time:.4f} seconds")

    # Inference
    start_inference = time.time()
    # print("Inference step: Generating response...")
    with torch.cuda.amp.autocast():  # Mixed precision context
        if num_gpus > 1:
            print("Performing inference on multiple GPUs...")
            outputs = model.module.generate(inputs, max_length=750, num_return_sequences=1)
        else:
            print("Performing inference on a single GPU or CPU...")
            outputs = model.generate(inputs, max_length=750, num_return_sequences=1)
    end_inference = time.time()
    inference_time = end_inference - start_inference
    print(f"Inference completed in {inference_time:.4f} seconds")

    # Postprocessing
    start_postprocessing = time.time()
    # print("Postprocessing step: Decoding output text...")
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    response_text = response.split("Chatbot:")[-1].strip()
    end_postprocessing = time.time()
    postprocessing_time = end_postprocessing - start_postprocessing
    # print(f"Postprocessing completed in {postprocessing_time:.4f} seconds")

    # Print detailed workflow logs
    print(f"Preprocessing time: {preprocessing_time:.4f} seconds")
    print(f"Inference time: {inference_time:.4f} seconds")
    print(f"Postprocessing time: {postprocessing_time:.4f} seconds")

    return response_text

# Streamlit interface
st.title("Chat with BCIT ChatBot")

# Conversation history
if 'conversation_history' not in st.session_state:
    st.session_state.conversation_history = []

# User input
user_input = st.text_input("You:", "")

send_button_disabled = st.session_state.get('send_button_disabled', False)

if st.button("Send", disabled=send_button_disabled):
    if user_input:
        # Disable the send button
        st.session_state.send_button_disabled = True
        with st.spinner("Chatbot is typing..."):
            # Generate response
            response = generate_response(user_input)  # Modified to remove conversation history
            
            # Update conversation history
            st.session_state.conversation_history.append({"user": user_input, "bot": response})
            
            # Re-enable the send button
            st.session_state.send_button_disabled = False

# Display conversation history
for i, chat in enumerate(st.session_state.conversation_history):
    st.markdown(f'<div class="chat-message"><img src="./images/user_icon.png" class="user-icon"/><div class="user-message">{chat["user"]}</div></div>', unsafe_allow_html=True)
    st.markdown(f'<div class="chat-message"><img src="./images/bot_icon.jpg" class="bot-icon"/><div class="bot-message">{chat["bot"]}</div></div>', unsafe_allow_html=True)

# Sidebar for model information
st.sidebar.title("Model Information")
st.sidebar.write(f"Model Path: {MODEL_PATH}")
st.sidebar.write(f"Using Device: {device}")

# Custom CSS for chat interface
st.markdown("""
    <style>
        .chat-message {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .user-icon, .bot-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .user-message, .bot-message {
            max-width: 70%;
            padding: 10px;
            border-radius: 10px;
        }
        .user-message {
            background-color: #DCF8C6;
            text-align: left;
        }
        .bot-message {
            background-color: #F1F0F0;
            text-align: left.
        }
        .chat-container {
            max-height: 400px.
            overflow-y: auto.
        }
    </style>
""", unsafe_allow_html=True)
