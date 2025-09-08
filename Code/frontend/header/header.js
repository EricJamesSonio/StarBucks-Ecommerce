// header.js - Enhanced Responsive Header Component
class HeaderComponent {
    constructor() {
        this.headerHTML = `
            <ul id="head-nav">
                <li class="logo-container">
                    <img class="logo" src="../assets/starbucksLogo-nocircle.png" alt="starbucks" onclick="window.location.href='../home/index.html'">
                </li>
                <li class="nav-list">
                    <nav>
                        <a href="../home/home.html">Home</a>
                        <a href="../menu/menu.html">Menu</a>
                        <a href="../about/about.html">About Us</a>
                    </nav>
                </li>
                <li class="icon-list-container">
                    <ul id="icon-list">
                        <li>
                            <a href="../cart/cart.html">
                                <img class="icon" src="../assets/shopping-cart.png" alt="cart">
                            </a>
                        </li>
                        <li>
                            <img class="icon" src="../assets/user.png" alt="user" onclick="window.location.href='../profile/profile.html'">
                        </li>
                        <li>
                            <button onclick="window.location.href='../login/login.html'">SIGN UP</button>
                        </li>
                    </ul>
                </li>
            </ul>
        `;
        
        this.headerCSS = `
            <style>
                /* Header Container */
                #head-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    list-style: none;
                    width: 100%;
                    padding: 1rem 2rem;
                    background-color: var(--main-color-darkgreen);
                    box-shadow: 0 3px 8px rgba(0, 54, 31, 0.9);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    box-sizing: border-box;
                    margin: 0;
                }
                
                /* Logo Container */
                .logo-container {
                    flex: 0 0 auto;
                }
                
                .logo {
                    height: clamp(3rem, 8vw, 5rem);
                    width: clamp(3rem, 8vw, 5rem);
                    filter: invert(1) brightness(1000%);
                    cursor: pointer;
                    user-select: none;
                    display: block;
                }
                
                /* Navigation Container */
                .nav-list {
                    flex: 1 1 auto;
                    display: flex;
                    justify-content: center;
                }
                
                .nav-list nav {
                    background-color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 25px;
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .nav-list nav a {
                    font-size: clamp(0.7rem, 2vw, 0.9rem);
                    text-transform: uppercase;
                    font-weight: 700;
                    text-decoration: none;
                    color: var(--main-color-darkgreen);
                    padding: 0.6rem 1.2rem;
                    border-radius: 20px;
                    display: inline-block;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                
                .nav-list nav a:hover {
                    background-color: var(--main-color-darkgreen);
                    color: white;
                    transform: translateY(-2px);
                }
                
                /* Icons Container */
                .icon-list-container {
                    flex: 0 0 auto;
                }
                
                #icon-list { 
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    list-style: none;
                    gap: 1rem;
                    margin: 0;
                    padding: 0;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                
                .icon {
                    filter: invert(1) brightness(1000%);
                    height: 1.8rem;
                    width: 1.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    user-select: none;
                }
                
                .icon:hover {
                    filter: brightness(0.8) invert(1);
                    transform: scale(1.1);
                }
                
                #icon-list button {
                    border-radius: 25px;
                    background-color: rgb(240, 240, 240);
                    padding: 0.5rem 1.8rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--main-color-darkgreen);
                    text-transform: uppercase;
                    border: none;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                }
                
                #icon-list button:hover {
                    background-color: var(--main-color-lightgreen);
                    color: #f0f4ef;
                    transform: translateY(-2px);
                }
                
                /* Tablet Responsiveness */
                @media (max-width: 1024px) {
                    #head-nav {
                        padding: 1rem 1.5rem;
                        gap: 1.2rem;
                    }
                    
                    .nav-list nav {
                        padding: 0.5rem 1rem;
                    }
                    
                    .nav-list nav a {
                        padding: 0.5rem 1rem;
                    }
                    
                    #icon-list {
                        gap: 0.8rem;
                    }
                    
                    #icon-list button {
                        padding: 0.4rem 1.5rem;
                    }
                }
                
                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    #head-nav {
                        flex-direction: column;
                        padding: 1.2rem 1rem;
                        gap: 1.2rem;
                    }
                    
                    .logo-container {
                        order: 1;
                    }
                    
                    .nav-list {
                        order: 3;
                        width: 100%;
                    }
                    
                    .icon-list-container {
                        order: 2;
                    }
                    
                    .nav-list nav {
                        flex-direction: column;
                        width: 100%;
                        padding: 0.8rem;
                        gap: 0.5rem;
                    }
                    
                    .nav-list nav a {
                        text-align: center;
                        padding: 0.8rem;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    
                    #icon-list {
                        justify-content: center;
                        width: 100%;
                        gap: 1.2rem;
                    }
                }
                
                /* Small Mobile Responsiveness */
                @media (max-width: 480px) {
                    #head-nav {
                        padding: 1rem 0.8rem;
                        gap: 1rem;
                    }
                    
                    .nav-list nav {
                        padding: 0.6rem;
                    }
                    
                    .nav-list nav a {
                        padding: 0.7rem;
                        font-size: 0.8rem;
                    }
                    
                    #icon-list {
                        gap: 1rem;
                    }
                    
                    .icon {
                        height: 1.6rem;
                        width: 1.6rem;
                    }
                    
                    #icon-list button {
                        padding: 0.4rem 1.2rem;
                        font-size: 0.8rem;
                    }
                }
                
                /* Extra Small Mobile */
                @media (max-width: 360px) {
                    #head-nav {
                        padding: 0.8rem 0.6rem;
                    }
                    
                    .nav-list nav a {
                        padding: 0.6rem;
                        font-size: 0.75rem;
                    }
                    
                    #icon-list {
                        gap: 0.8rem;
                    }
                    
                    #icon-list button {
                        padding: 0.35rem 1rem;
                        font-size: 0.75rem;
                    }
                }
            </style>
        `;
    }
    
    render() {
        // Create header container
        const headerContainer = document.createElement('header');
        headerContainer.innerHTML = this.headerCSS + this.headerHTML;
        
        // Add to the beginning of the body
        document.body.insertBefore(headerContainer, document.body.firstChild);
        
        // Add CSS to prevent space at top
        const bodyStyle = document.createElement('style');
        bodyStyle.textContent = `
            /* Reset body margin and padding */
            body {
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Remove any default browser spacing */
            html, body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
            }
            
            /* Calculate dynamic padding based on header height */
            body {
                padding-top: 0 !important;
            }
            
            /* Apply padding to the first section instead of body */
            section:first-of-type {
                padding-top: 0 !important;
            }
        `;
        document.head.appendChild(bodyStyle);
        
        // Make sure CSS variables are defined
        this.ensureCSSVariables();
        
        // Update section padding when window resizes
        this.updateSectionPadding();
        window.addEventListener('resize', this.updateSectionPadding.bind(this));
    }
    
    updateSectionPadding() {
        const header = document.querySelector('#head-nav');
        const firstSection = document.querySelector('section:first-of-type');
        
        if (header && firstSection) {
            const headerHeight = header.offsetHeight;
            firstSection.style.paddingTop = headerHeight + 'px';
        }
    }
    
    ensureCSSVariables() {
        // Check if CSS variables are already defined
        if (!document.documentElement.style.getPropertyValue('--main-color-darkgreen')) {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --main-color-green: #00704a;
                    --main-color-darkgreen: #00482b;
                    --main-color-lightgreen: #009959;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize and render header when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const header = new HeaderComponent();
    header.render();
});