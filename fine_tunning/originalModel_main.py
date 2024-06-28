import torch
import time
from transformers import AutoTokenizer, AutoModelForCausalLM
import streamlit as st
import base64

# Use the original Llama-3 model from Hugging Face
MODEL_NAME = "meta-llama/Meta-Llama-3-8B"

# Initialize device configuration
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
num_gpus = torch.cuda.device_count()
print(f"Using {num_gpus} GPU(s): {[torch.cuda.get_device_name(i) for i in range(num_gpus)]}")

@st.cache_resource
def load_model_and_tokenizer():
    print("Loading model with mixed precision...")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME, 
        device_map={"": 0},  # Specify single GPU
        torch_dtype=torch.float16,  # Use float16 for mixed precision
        load_in_8bit=True           # Load model in 8-bit precision to save memory
    )
    print("Model loaded successfully.")

    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token  # Set the padding token to EOS token
    print("Tokenizer loaded successfully.")
    
    return model, tokenizer

model, tokenizer = load_model_and_tokenizer()

def generate_response(new_user_input):
    # Preprocessing
    start_preprocessing = time.time()
    input_text = SYSTEM_PROMPT + f"\nUser: {new_user_input}\nChatbot:"
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True)
    inputs = {key: value.to(device) for key, value in inputs.items()}
    end_preprocessing = time.time()
    preprocessing_time = end_preprocessing - start_preprocessing
    print(f"Preprocessing completed in {preprocessing_time:.4f} seconds")

    # Inference
    start_inference = time.time()
    print("Performing inference on a single GPU or CPU...")
    outputs = model.generate(
        inputs["input_ids"], 
        attention_mask=inputs["attention_mask"], 
        max_length=750, 
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id  # Ensure pad token id is set
    )
    end_inference = time.time()
    inference_time = end_inference - start_inference
    print(f"Inference completed in {inference_time:.4f} seconds")

    # Postprocessing
    start_postprocessing = time.time()
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    response_text = response.split("Chatbot:")[-1].strip()
    end_postprocessing = time.time()
    postprocessing_time = end_postprocessing - start_postprocessing

    print(f"Preprocessing time: {preprocessing_time:.4f} seconds")
    print(f"Inference time: {inference_time:.4f} seconds")
    print(f"Postprocessing time: {postprocessing_time:.4f} seconds")

    return response_text

# System prompt used within the codebase
SYSTEM_PROMPT = """
You are a helpful chatbot.
"""

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
        st.session_state.send_button_disabled = True
        with st.spinner("Chatbot is typing..."):
            response = generate_response(user_input)
            st.session_state.conversation_history.append({"user": user_input, "bot": response})
            st.session_state.send_button_disabled = False

def get_base64_image(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

# Encode images to base64
user_icon_base64 = get_base64_image("./images/user_icon.png")
bot_icon_base64 = get_base64_image("./images/bot_icon.jpg")

# Display conversation history
for i, chat in enumerate(st.session_state.conversation_history):
    st.markdown(f'<div class="chat-message"><img src="data:image/png;base64,{user_icon_base64}" class="user-icon"/><div class="user-message">{chat["user"]}</div></div>', unsafe_allow_html=True)
    st.markdown(f'<div class="chat-message"><img src="data:image/jpeg;base64,{bot_icon_base64}" class="bot-icon"/><div class="bot-message">{chat["bot"]}</div></div>', unsafe_allow_html=True)

# Sidebar for model information
st.sidebar.title("Model Information")
st.sidebar.write(f"Model Name: {MODEL_NAME}")
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
