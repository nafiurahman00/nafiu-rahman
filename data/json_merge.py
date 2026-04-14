import json
import os

data_dir = os.path.dirname(os.path.abspath(__file__))

def load(filename):
    with open(os.path.join(data_dir, filename), encoding='utf-8') as f:
        return json.load(f)

all_data = {
    "profile":      load("profile.json"),
    "education":    load("education.json"),
    "research":     load("research.json"),
    "projects":     load("projects.json"),
    "work":         load("work.json"),
    "achievements": load("achievements.json"),
    "skills":       load("skills.json"),
    "talks":        load("talks.json"),
    "coursework":   load("coursework.json"),
}

output_path = os.path.join(data_dir, "all.json")
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False)

print(f"Written to {output_path}")
