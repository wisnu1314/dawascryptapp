from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import dawascrypt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/encrypt', methods=['POST'])
def encrypt_data():
    """
    Endpoint to encrypt data
    
    Expected JSON:
    {
        "key": "your_encryption_key",
        "message": "your_message_to_encrypt",
        "mode": 1  # 1 for ECB, 2 for Counter, 0 or 3 for CBC
    }
    """
    try:
        data = request.json
        
        # Check if required fields are present
        if not all(k in data for k in ("key", "message", "mode")):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Extract data
        key = data["key"]
        message = data["message"]
        mode_num = data["mode"]
        print(f"{mode_num}")
        
        # Determine encryption mode
        mode = dawascrypt.determine_mode(mode_num)
        
        # Encrypt the message
        encrypted = dawascrypt.encrypt(key, message, mode)
        
        # Base64 encode the encrypted message for safe transport
        encoded = base64.b64encode(encrypted.encode('utf-8', errors='surrogateescape')).decode('utf-8')
        
        return jsonify({
            "ciphertext": encoded,
            "mode": mode
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/decrypt', methods=['POST'])
def decrypt_data():
    """
    Endpoint to decrypt data
    
    Expected JSON:
    {
        "key": "your_encryption_key",
        "ciphertext": "your_base64_encoded_ciphertext",
        "mode": 1  # 1 for ECB, 2 for Counter, 0 or 3 for CBC
    }
    """
    try:
        data = request.json
        
        # Check if required fields are present
        if not all(k in data for k in ("key", "ciphertext", "mode")):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Extract data
        key = data["key"]
        encoded_ciphertext = data["ciphertext"]
        mode_num = int(data["mode"])
        
        # Determine decryption mode
        mode = dawascrypt.determine_mode(mode_num)
        
        # Base64 decode the ciphertext
        ciphertext = base64.b64decode(encoded_ciphertext).decode('utf-8', errors='surrogateescape')
        
        # Decrypt the message
        decrypted = dawascrypt.decrypt(key, ciphertext, mode)
        
        return jsonify({
            "plaintext": decrypted,
            "mode": mode
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/modes', methods=['GET'])
def get_modes():
    """Return available encryption modes"""
    return jsonify({
        "modes": [
            {"id": 1, "name": "ecb", "description": "Electronic Codebook Mode"},
            {"id": 2, "name": "counter", "description": "Counter Mode"},
            {"id": 3, "name": "cbc", "description": "Cipher Block Chaining Mode"}
        ]
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "service": "DAWASCrypt API"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)