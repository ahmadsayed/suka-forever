1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-faq");
    const faqList = document.querySelector("#faq-list");
    const faqs = [
        {
            question: "What is this website?",
            answer: "The main goal is to give them a Git-like experience while collaborating with other artists or developers in creating 3D models or 3D environments."
        },
        {
            question: "Who is Suka?",
            answer: "Suka and friends are a small community representing diversity. Each one of them has its persona and energy. These characters come together to build a multicultural atmosphere. They can be a part ofese characters come together to build a multicultural atmosphere. They can be a part of a game or a puzzle. They can also play a role in an animated movie. S a game or a puzzle. They can also play a role in an animated movie."
        },
        {
            question: "How can I access the assets files?",
            answer: "We will sell our assets on Opensea as NFTs; you need to go to Opensea with your Metamask wallet and purchase it from there. With the same wallet, the download button will open for you on the website."
        },  
        {
            question: "Can I sell or return the SUKA?",
            answer: "You can not return, but you can sell it on Opensea. As soon as the NFT is transferred from your Wallet, you will no longer be able to download the asset from this website and lose the right to use it in future projects."
        },   
        {
            question: "What is the future of SukaVerse?",
            answer: "We have yet to publish a roadmap. We are enhancing our dApp, enabling users to customize and mint their SUKA"
        }
    ]
    faqs.forEach(faq => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".question").textContent = faq.question;
        clone.querySelector(".answer").textContent = faq.answer;
    
        faqList.appendChild(clone);
    })


})