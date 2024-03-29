1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-team");
    const teamList = document.querySelector("#team-list");
    const authors = [
        {
            role: "Artist",
            name: "Khulood Radi",
            image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/tota/images/300x300.jpg",
            description: "3D artist, specialized in 3D animation and modeling, building optimized real-time 3D assets used in games, and 3D interactive websites."
        },
        {
            role: "Developer",
            name: "Ahmed Hassan",
            image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/howdy/images/300x300.jpg",
            description: "Developer, System Engineer, and Cloud architect exploring how to leverage Web 3.0 in contents creation collaboration and monetization."
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