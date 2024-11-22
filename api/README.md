# Welcome to your python API 👋

# Instalação
py -3 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Rodar 
python ./run.py

# API URL Local
ngrok http http://127.0.0.1:5000

Após obter a URL com ngrok, troque ela no arquivo .env e .env.local para que o aplicativo use requests https.
Todo aplicativo de celular só consegue fazer requests com protocolo HTTPS.