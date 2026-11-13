"""Optional YouTube upload helper. Keep credentials outside Git."""
from pathlib import Path
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
def authorize(client_secret="client_secret.json", token_file="token.json"):
    from google_auth_oauthlib.flow import InstalledAppFlow
    flow = InstalledAppFlow.from_client_secrets_file(client_secret, SCOPES)
    creds = flow.run_local_server(port=0)
    Path(token_file).write_text(creds.to_json(), encoding="utf-8")
    return creds
def upload_video(video_path, title, description="", privacy="private", token_file="token.json"):
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    creds = Credentials.from_authorized_user_file(token_file, SCOPES)
    youtube = build("youtube", "v3", credentials=creds)
    body = {"snippet": {"title": title[:100], "description": description[:5000], "categoryId": "24"},
            "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False}}
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
    return response
