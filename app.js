const taskApiUrl = "https://script.google.com/macros/s/AKfycbxvLbA_UIGEdxnr0VaPny6qwsIsnT1tPJvRaSt_DdM6-P5ncwjwXKTpHrIJNkDcwwUd4A/exec";

async function addFoodToList(foodName) {
  fetch(`${taskApiUrl}?foodName=${foodName}`).then(response => {
    document.querySelector('.results').innerHTML = response;
  });
}

async function updateTag() {
  try {
    const res = await fetch('/api/tag');
    const data = await res.json();
    if (data.last_tag !== "NONE") {
      document.getElementById('tag').innerText = data.last_tag;
    }
  } catch (e) {
    console.error("API error", e);
  }
}
// Poll the ESP32 every 500ms for fresh scans
// setInterval(updateTag, 5000);