1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-about");
    const accountContainer = document.querySelector("#about-container");
    const sukas = [
        {
            brief: "A story from the Middleast",
            name: "Rema",
            
            image: "https://ipfs.filebase.io/ipfs/QmVw4GrmA5T9wtXJDtyyuuCVZvkiwQA5QkdYRhCoNC1Lj5?filename=900x600.jpg",
            story: "She has a strong-willed and nurturing aura, Reema is an extraordinary mother, a caring sister, and a Fearless daughter."
        },
        {
            brief: "A story from India",
            name: "Muka",
            image: "https://ipfs.filebase.io/ipfs/QmfRJ2Hq45CtDMhku1MvByLvHTQS5oaUA7CNpz2gkwzQr5?filename=muka600x900_BG1.jpg",
            story: "Muka specializes in all forms of relaxation, She is friendly, funny, and spiritually connected."
 
        },
        {
            brief: "A wild wild West",
            name: "Howdy",
            image: "https://ipfs.filebase.io/ipfs/QmR6omxqY1JAKq96kVrG8Vz9tku45VyuhmT2fPje9JDsHM?filename=900x600.jpg",
            story: "Howdy is a wise soul, He seeks adventures to fulfill his curiosity, He is solid yet thoughtful and considerate."
 
        }
    ]
    sukas.forEach(suka => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".product-item-img").src = suka.image;
        clone.querySelector(".section-heading-upper").textContent = suka.brief;
        clone.querySelector(".section-heading-lower").textContent = suka.name;
        clone.querySelector(".story").textContent = suka.story;
    
        accountContainer.appendChild(clone);
    })


})