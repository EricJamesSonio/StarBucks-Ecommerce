// login/js/init.js
async function loadComponent(path, containerId, clear = false) {
  const res = await fetch(path);
  const html = await res.text();
  const container = document.getElementById(containerId);
  if (clear) container.innerHTML = ""; // remove previous content
  container.insertAdjacentHTML("beforeend", html);
}

async function init() {
  await loadComponent("components/start-screen.html", "component-root");

  // Load config & then auth.js
  const configScript = document.createElement("script");
  configScript.src = "js/config.js";
  configScript.onload = () => {
    const authScript = document.createElement("script");
    authScript.src = "js/auth.js";
    document.body.appendChild(authScript);
  };
  document.body.appendChild(configScript);
}

init();
