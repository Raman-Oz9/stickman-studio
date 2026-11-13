"""Simple template-based story starter; no paid AI API required."""
import random
TEMPLATES = {
 "comedy": [("A stickman wanted to become famous.", "The plan was perfect... almost.", "His big moment arrived at the worst possible time.", "At least everyone remembered him.")],
 "lesson": [("A stickman had one impossible dream.", "People told him to give up.", "He kept practising when nobody was watching.", "The result surprised everyone, including him.")],
 "action": [("A quiet stickman guarded the last power crystal.", "A shadow appeared at the edge of the city.", "The two rivals clashed in a spectacular showdown.", "When the dust settled, the city was safe.")],
 "facts": [("Have you ever wondered how a tiny idea changes the world?", "Every great invention begins with a question.", "Experiment, failure and curiosity move discoveries forward.", "That is how small ideas become big breakthroughs.")]
}
def make_story(kind="lesson", title=None):
    """Return a basic four-scene script. Edit or expand it before publishing."""
    lines = random.choice(TEMPLATES.get(kind, TEMPLATES["lesson"]))
    actions = ["idle", "walk", "run", "jump"]
    return {
      "title": title or f"Stickman {kind.title()}",
      "description": "An original stickman animation created with Stickman Studio.",
      "scenes": [{"duration": 4, "narration": line, "visual": line, "action": actions[i], "background": ["#EAF4FF", "#F4F0FF", "#FFF4E6", "#EAFBEF"][i]} for i, line in enumerate(lines)]
    }
