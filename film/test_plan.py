#!/usr/bin/env python3
import unittest, os, glob
from plan_scenes import plan

class TestPlanScenes(unittest.TestCase):
    def test_locations_detection(self):
        cases = [
            ("The athlete played soccer in the stadium.", "sports"),
            ("The teacher taught students in the classroom school.", "school"),
            ("The chef cooked dinner in the kitchen.", "kitchen"),
            ("The farmer drove the tractor across the farm.", "farm"),
            ("The doctor examined patients in the hospital.", "hospital"),
            ("The pilot flew the jet from the airport runway.", "airport"),
        ]
        for text, expected_loc in cases:
            scenes = plan(text)
            self.assertTrue(len(scenes) > 0)
            self.assertEqual(scenes[0]["location"], expected_loc, f"Failed for text: '{text}'")

    def test_output_fields(self):
        text = "The doctor performed surgery in the hospital. \"He will recover,\" said the nurse."
        scenes = plan(text)
        self.assertTrue(len(scenes) > 0)
        expected_fields = {
            "text", "quote", "location", "tod", "weather", "era",
            "speaker", "role", "role2", "characters", "nouns", "mood", "shots",
            "action", "object", "camera_intent"
        }
        for scene in scenes:
            for field in expected_fields:
                self.assertIn(field, scene, f"Missing field {field} in scene")

    def test_beats_per_sentence_and_attributes(self):
        text = "The scientist built a rocket in the laboratory and launched it into space."
        scenes = plan(text)
        self.assertTrue(1 <= len(scenes) <= 6)
        for scene in scenes:
            self.assertIn("action", scene)
            self.assertIn("object", scene)
            self.assertIn("camera_intent", scene)
            self.assertTrue(isinstance(scene["action"], str) and len(scene["action"]) > 0)
            self.assertTrue(isinstance(scene["object"], str) and len(scene["object"]) > 0)
            self.assertTrue(isinstance(scene["camera_intent"], str) and len(scene["camera_intent"]) > 0)

    def test_all_12_sample_scripts(self):
        script_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "scripts")
        script_files = sorted(glob.glob(os.path.join(script_dir, "*.txt")))
        self.assertTrue(len(script_files) >= 12, f"Expected at least 12 scripts, found {len(script_files)}")
        for sf in script_files:
            with open(sf, encoding="utf8") as f:
                content = f.read()
            scenes = plan(content)
            self.assertTrue(len(scenes) > 0, f"Plan failed or returned 0 scenes for {sf}")
            for scene in scenes:
                self.assertIn("location", scene)
                self.assertIn("action", scene)
                self.assertIn("object", scene)
                self.assertIn("camera_intent", scene)

if __name__ == "__main__":
    unittest.main()
