const themeToggle = document.getElementById("theme-toggle");
const promptForm = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");
const promptBtn = document.getElementById("prompt-btn");
const generateBtn = document.getElementById("generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.getElementById("gallery-grid");
const API_KEY = "HUGGING-FACE-TOKKEN";
const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
];

// Set theme based on saved preference or system default
(()=>{
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
const isDarkTheme = document.body.classList.toggle('dark-theme');
localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
themeToggle.querySelector("i").className= isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};


//calculate image dimensions based on aspect ratio
const getImageDimensions = (aspectRatio) => {
    let baseSize;
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);
// Ensure dimensions are multiples of 16
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return {width: calculatedWidth, height: calculatedHeight};
};

const updateImageCard = (imgIndex,imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img" />
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
}

const generateImages = async(selectedModel,imageCount, aspectRatio, promptText) => {
const MODEL_URLS = `https://api-inference.huggingface.co/models/${selectedModel}`;
const {width,height} = getImageDimensions(aspectRatio);
generateBtn.setAttribute("disabled","true");

// creating a new array of promises for each image generation
const imagePromises = Array.from({length: imageCount}, async(_, i) => {
    //Send request to the model API
    try {
        const response =  await fetch( MODEL_URLS,{
        headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "x-use-cache": "false",
        },
        method: "POST",
           body:JSON.stringify({
            inputs:promptText,
            parameters: {width,height},
           }),
        
        });

        if (!response.ok) throw new Error((await response.json())?.error)
        //Convert the response to a blob and create an object URL
        const result =  await response.blob();
        updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.log(error); 
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.classList.replace("loading","error");
            imgCard.querySelector(".status-text").textContent = "Error generating image";
        }
})

await Promise.allSettled(imagePromises);
generateBtn.removeAttribute("disabled");
};

//create placeholder cards with loading spinners
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = ""; // Clear previous images
    
    for (let i = 0; i < imageCount; i++) {
     gridGallery.innerHTML += `
                    <div class="img-card loading " id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div
                    </div>`;
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};
// handle form submission
const handleFormSubmit = (event) => {
    event.preventDefault();

    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

 createImageCards(selectedModel, imageCount, aspectRatio, promptText);   
}

promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})
promptForm.addEventListener("submit",handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
