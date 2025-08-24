async function loadComponent(htmlPath) {
    try {   
        const response = await fetch(htmlPath);
        const html = await response.text();

        document.getElementById("cart-contents").innerHTML = htmlPath;
    } catch(error) {
        console.error("Component Failed to load :", error);
    }
}

loadComponent("./components/cartContents.html");