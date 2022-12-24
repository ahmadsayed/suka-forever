1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-team");
    const teamList = document.querySelector("#team-list");
    const authors = [
        {
            role: " Co-founder / Artist",
            name: "Khulood Radi",
            image: "https://cloudflare-ipfs.com/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/tota/images/300x300.jpg",
            description: "I started as a 3D animator, currently focusing on building real-time models and animation that I can use to create a 3D interactive website."
        },
        {
            role: " Co-founder / Developer",
            name: "Ahmed Hassan",
            image: "https://ipfs.filebase.io/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/howdy/images/300x300.jpg",
            description: "I am a developer, System Engineer, and Cloud architect exploring how to help contents creator monetize their content in a censorship resistance blockchain-based governed platform."
        },
    ]
    authors.forEach(profile => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".profile-img").src = profile.image;
        clone.querySelector(".profile-name").textContent = profile.name;
        clone.querySelector(".profile-role").textContent = profile.role;
        clone.querySelector(".profile-description").textContent = profile.description;
    
        teamList.appendChild(clone);
    })


})