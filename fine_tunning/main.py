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

print("Initializing device configuration...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
num_gpus = torch.cuda.device_count()
print(f"Using {num_gpus} GPU(s): {[torch.cuda.get_device_name(i) for i in range(num_gpus)]}")

print("Loading model with mixed precision...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, 
    device_map='auto',
    torch_dtype=torch.float16,
    load_in_8bit=True
)

if num_gpus > 1:
    model = torch.nn.DataParallel(model)
print("Model loaded successfully.")

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
print("Tokenizer loaded successfully.")

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

### Sample Response:
**User**: "What are the main fields covered in BCIT's 'Applied & Natural Sciences' program?"
**Chatbot**:
- **Direct Answer**: The main fields covered in BCIT's "Applied & Natural Sciences" program are: Biotechnology, Forensic Science, Health Sciences, and Natural Sciences.
- **URL for More Information**: For more information, visit the [Applied & Natural Sciences home page](https://www.bcit.ca/applied-natural-sciences/).
- **Navigation Instructions**: To find more information, start at the BCIT main page (https://www.bcit.ca). From there, navigate to the Applied & Natural Sciences home page by clicking on the "Applied & Natural Sciences" link in the left-hand menu. Then, click on the "Programs & Courses" link in the top menu to view a list of all the programs and courses offered by the Applied & Natural Sciences faculty.

Always be polite, professional, and eager to help.
"""

# Function to generate response with profiling
def generate_response(new_user_input):
    input_text = SYSTEM_PROMPT + f"\nUser: {new_user_input}\nChatbot:"
    
    start_time = time.time()
    
    # Preprocessing
    pre_start = time.time()
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)
    pre_end = time.time()
    preprocessing_time = pre_end - pre_start
    print(f"Preprocessing time: {preprocessing_time:.2f} seconds")
    
    # Inference
    inf_start = time.time()
    with torch.cuda.amp.autocast():  # Mixed precision context
        outputs = model.module.generate(inputs, max_length=750, num_return_sequences=1) if num_gpus > 1 else model.generate(inputs, max_length=750, num_return_sequences=1)
    inf_end = time.time()
    inference_time = inf_end - inf_start
    print(f"Inference time: {inference_time:.2f} seconds")
    
    # Postprocessing
    post_start = time.time()
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    response_text = response.split("Chatbot:")[-1].strip()
    post_end = time.time()
    postprocessing_time = post_end - post_start
    print(f"Postprocessing time: {postprocessing_time:.2f} seconds")
    
    total_time = time.time() - start_time
    print(f"Total time: {total_time:.2f} seconds")
    
    return response_text

# Streamlit interface
st.title("Chat with BCIT ChatBot")

# Conversation history
if 'conversation_history' not in st.session_state:
    st.session_state.conversation_history = []

# User input
user_input = st.text_input("You:", "")

if st.button("Send"):
    if user_input:
        # Generate response
        response = generate_response(user_input)
        
        # Update conversation history
        st.session_state.conversation_history.append({"user": user_input, "bot": response})
        
        # Display conversation
        for i, chat in enumerate(st.session_state.conversation_history):
            st.markdown(f'<div class="chat-message"><img src="user-icon.png" class="user-icon"/><div class="user-message">{chat["user"]}</div></div>', unsafe_allow_html=True)
            st.markdown(f'<div class="chat-message"><img src="bot-icon.png" class="bot-icon"/><div class="bot-message">{chat["bot"]}</div></div>', unsafe_allow_html=True)

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
            text-align: left;
        }
        .chat-container {
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
""", unsafe_allow_html=True)

# No need to explicitly run Streamlit; it is handled by the `streamlit run` command
