const content = document.getElementById('content');

function showPage(page) {
  switch (page) {
    case 'home':
      content.innerHTML = `<h1>Welcome Home!</h1><p>This is the home page.</p>`;
      break;
    case 'about':
      content.innerHTML = `<h1>About Us</h1><p>We are Gen Z devs on fire 🔥</p>`;
      break;
    case 'contact':
      content.innerHTML = `<h1>Contact</h1><p>Hit us up at email@example.com</p>`;
      break;
  }
}

// Load default page
showPage('home');
