1
window.addEventListener('DOMContentLoaded', event => {
    const template = document.querySelector("#template-faq");
    const faqList = document.querySelector("#faq-list");
    const faqs = [
        {
            question: "What is this website?",
            answer: "We give 3D Artist a Git-like experience while collaborating with other artists or developers in creating 3D models or 3D environments."
        },
        {
            question: "Who is Suka?",
            answer: "Suka and friends are \" Matryoshka\" inspired chracters. They are a small community representing diversity. Each one of them has their persona and energy. These characters come together to build a multicultural loving atmosphere.They can be a part of a game or a puzzle. They can also play a role in an animated movie."
        }
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