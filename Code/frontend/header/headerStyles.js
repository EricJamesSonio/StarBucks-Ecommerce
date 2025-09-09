export const headerCSS = `
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
        height: clamp(2.5rem, 8vw, 5rem);
        width: clamp(2.5rem, 8vw, 5rem);
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
        height: clamp(1.5rem, 4vw, 1.8rem);
        width: clamp(1.5rem, 4vw, 1.8rem);
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
        border-radius: 50%;
        object-fit: cover;
    }

    .icon:hover {
        filter: brightness(0.8) invert(1);
        transform: scale(1.1);
    }

    #icon-list button {
        border-radius: 25px;
        background-color: rgb(240, 240, 240);
        padding: 0.5rem 1.5rem;
        font-weight: 700;
        font-size: clamp(0.7rem, 2vw, 0.9rem);
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

    /* Profile Modal Styles (unchanged) */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto; }
    .modal-content { background: #fff; padding: 25px 30px; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; box-shadow: 0 15px 35px rgba(0,0,0,0.3); position: relative; font-family: 'Inter', sans-serif; overflow-y: auto; animation: modalSlideIn 0.3s ease-out; }
    .close { position: absolute; top: 15px; right: 20px; font-size: 28px; cursor: pointer; color: #666; z-index: 1000; background: rgba(255,255,255,0.9); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; line-height: 1; }
    .close:hover { color: #000; background: rgba(255,255,255,1); }
    #profile-modal h2 { text-align: center; margin-bottom: 20px; color: #006241; font-size: 1.8rem; }
    #profile-modal img#profile-image { display: block; margin: 0 auto 15px; width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #006241; }
    #profile-image-url { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 15px; font-size: 14px; box-sizing: border-box; }
    #open-image-picker { width: 100%; padding: 12px; background: #006241; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 20px; font-size: 15px; font-weight: 600; transition: background-color 0.3s ease; }
    #open-image-picker:hover { background: #004f1a; transform: translateY(-2px); }
    #profile-form label { display: block; margin: 15px 0 5px; font-weight: 600; color: #333; font-size: 14px; }
    #profile-form input, #profile-form select { width: 100%; padding: 12px 15px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 15px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s ease; }
    #profile-form input:focus, #profile-form select:focus { outline: none; border-color: #006241; box-shadow: 0 0 0 3px rgba(0, 98, 65, 0.1); }
    #profile-form h3 { margin: 25px 0 12px; color: #006241; border-bottom: 2px solid #006241; padding-bottom: 8px; font-size: 16px; }
    #profile-form button[type="submit"] { width: 100%; padding: 15px; background: #006241; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 25px; transition: all 0.3s ease; }
    #profile-form button[type="submit"]:hover { background: #004f1a; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 98, 65, 0.3); }

    /* Scrollbar styling */
    .modal-content::-webkit-scrollbar { width: 8px; }
    .modal-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
    .modal-content::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
    .modal-content::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

    /* Animation */
    @keyframes modalSlideIn { from { opacity: 0; transform: translateY(-50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* Responsive design */
    @media (max-width: 1024px) {
        .logo { height: clamp(2.5rem, 7vw, 4rem); width: clamp(2.5rem, 7vw, 4rem); }
        .nav-list nav a { font-size: clamp(0.65rem, 2vw, 0.85rem); padding: 0.4rem 0.8rem; }
        .icon { height: clamp(1.4rem, 3.5vw, 1.6rem); width: clamp(1.4rem, 3.5vw, 1.6rem); }
        #icon-list button { font-size: clamp(0.65rem, 2vw, 0.85rem); padding: 0.35rem 1.2rem; }
    }

    @media (max-width: 768px) {
        #head-nav { flex-direction: column; gap: 0.8rem; align-items: center; }
        .nav-list { width: 100%; justify-content: center; }
        .nav-list nav { width: 100%; justify-content: center; }
        .nav-list nav a { font-size: clamp(0.65rem, 3vw, 0.85rem); }
        #icon-list { justify-content: center; gap: 0.5rem; }
    }

    @media (max-width: 480px) {
        #head-nav { padding: 0.8rem 1rem; gap: 0.5rem; }
        .logo { height: clamp(1.8rem, 10vw, 3rem); width: clamp(1.8rem, 10vw, 3rem); }
        .nav-list nav a { font-size: clamp(0.55rem, 4vw, 0.8rem); padding: 0.25rem 0.6rem; }
        #icon-list { gap: 0.4rem; }
        .icon { height: clamp(1.2rem, 8vw, 1.5rem); width: clamp(1.2rem, 8vw, 1.5rem); }
        #icon-list button { font-size: clamp(0.55rem, 4vw, 0.75rem); padding: 0.25rem 0.9rem; }
    }
</style>
`;
