import os
import logging
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from huggingface_hub import HfApi, HfFolder

# Set environment variable for debugging
os.environ['CUDA_LAUNCH_BLOCKING'] = '1'

# Disable cuDNN to get better error messages
torch.backends.cudnn.enabled = False

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define paths
model_name = "meta-llama/Meta-Llama-3-8B"
new_model = "Llama-3-8B-BCITchatBot-finetune-verison1"

# Ensure you are logged in to Hugging Face
token = os.getenv("HF_TOKEN")
if not token:
    raise ValueError("No Hugging Face token found. Please set the HF_TOKEN environment variable.")

api = HfApi()
HfFolder.save_token(token)

# Load tokenizer
logger.info("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

# Load the model
logger.info("Loading model...")
model = AutoModelForCausalLM.from_pretrained(new_model)

# Push model and tokenizer to Hugging Face Hub
try:
    logger.info("Pushing model to Hugging Face Hub...")
    repo_url = api.create_repo(repo_id=new_model, token=token, exist_ok=True)
    model.push_to_hub(new_model, use_auth_token=token)
    logger.info("Model pushed to Hugging Face Hub")

    logger.info("Pushing tokenizer to Hugging Face Hub...")
    tokenizer.push_to_hub(new_model, use_auth_token=token)
    logger.info("Tokenizer pushed to Hugging Face Hub")
except Exception as e:
    logger.error(f"Error pushing to Hugging Face Hub: {e}")
    raise
