import torch
import time
from transformers import AutoTokenizer, AutoModelForCausalLM

# Use the original Llama-3 model from Hugging Face
MODEL_NAME = "meta-llama/Meta-Llama-3-8B"

# Initialize device configuration
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
num_gpus = torch.cuda.device_count()
print(f"Using {num_gpus} GPU(s): {[torch.cuda.get_device_name(i) for i in range(num_gpus)]}")

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
    inputs = tokenizer(new_user_input, return_tensors="pt", padding=True, truncation=True)
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
    end_postprocessing = time.time()
    postprocessing_time = end_postprocessing - start_postprocessing

    print(f"Preprocessing time: {preprocessing_time:.4f} seconds")
    print(f"Inference time: {inference_time:.4f} seconds")
    print(f"Postprocessing time: {postprocessing_time:.4f} seconds")

    return response

# Example usage
user_input = "What is Youtube?"
response = generate_response(user_input)
print("User's question:", user_input)
print("Model response:", response)
