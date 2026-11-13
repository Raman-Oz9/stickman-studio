import argparse, json
from pathlib import Path
from .render import render_project
from .scriptgen import make_story
from .youtube import authorize, upload_video
def main():
    p = argparse.ArgumentParser(prog="stickman-studio")
    sub = p.add_subparsers(dest="command", required=True)
    r = sub.add_parser("render", help="Render a JSON story")
    r.add_argument("script"); r.add_argument("--format", choices=["short", "long"], default="short")
    r.add_argument("--voice", action="store_true"); r.add_argument("--outdir", default="output")
    g = sub.add_parser("generate-script", help="Create a template-based sample story")
    g.add_argument("--kind", choices=["comedy", "lesson", "action", "facts"], default="lesson")
    g.add_argument("--output", default="examples/generated_story.json")
    a = sub.add_parser("auth-youtube", help="Authorize YouTube upload")
    a.add_argument("--client-secret", default="client_secret.json")
    u = sub.add_parser("upload", help="Upload an MP4 to YouTube")
    u.add_argument("video"); u.add_argument("--title", required=True)
    u.add_argument("--description", default=""); u.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    u.add_argument("--token", default="token.json")
    args = p.parse_args()
    if args.command == "render":
        result = render_project(args.script, args.format, args.voice, args.outdir); print(f"Rendered: {result}")
    elif args.command == "generate-script":
        path = Path(args.output); path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(make_story(args.kind), indent=2), encoding="utf-8"); print(f"Created: {path}")
    elif args.command == "auth-youtube":
        authorize(args.client_secret); print("YouTube authorization saved to token.json")
    elif args.command == "upload":
        result = upload_video(args.video, args.title, args.description, args.privacy, args.token); print(json.dumps(result, indent=2))
if __name__ == "__main__": main()
