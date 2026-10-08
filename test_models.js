const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('Please set GEMINI_API_KEY'); process.exit(1); }
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log('Available models:', data.models.map(m => m.name));
    } else {
      console.log('Error:', data);
    }
  })
  .catch(err => console.error(err));
