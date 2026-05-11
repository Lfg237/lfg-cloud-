const users = {
    "michel233": true,
    "client45": true,
    "admin2026": true
};

let currentCategory = 'all';
let filesData = [];

function loginUser(){

    const input = document.getElementById('userId').value.trim().toLowerCase();

    if(users[input.toLowerCase()]){

        localStorage.setItem('cloudUser', input.toLowerCase());

        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('cloudApp').style.display = 'flex';

        document.getElementById('welcome').innerHTML = `Bienvenue ${input.toLowerCase()}`;

        loadFiles();

    }else{
        document.getElementById('error').innerHTML = 'ID incorrect';
    }
}

function getCategory(file){

    const type = file.type;

    if(type.includes('image')) return 'images';
    if(type.includes('video')) return 'videos';
    if(type.includes('audio')) return 'audio';

    return 'documents';
}

function saveFiles(){

    const currentUser = localStorage.getItem('cloudUser');

    localStorage.setItem('cloudFiles_' + currentUser, JSON.stringify(filesData));
}

function loadFiles(){

    const currentUser = localStorage.getItem('cloudUser');

    const saved = localStorage.getItem('cloudFiles_' + currentUser);

    if(saved){
        filesData = JSON.parse(saved);
    }

    renderFiles();
}

function generateShareLink(fileData, fileName){

    const encoded = encodeURIComponent(fileData);

    return `${window.location.origin}${window.location.pathname}?file=${encoded}&name=${encodeURIComponent(fileName)}`;
}

function copyLink(link){

    navigator.clipboard.writeText(link);

    alert('Lien copié');
}

function renderFiles(){

    const grid = document.getElementById('filesGrid');
    grid.innerHTML = '';

    let totalSize = 0;

    filesData.forEach((file,index)=>{

        totalSize += file.size;

        if(currentCategory !== 'all' && file.category !== currentCategory){
            return;
        }

        const card = document.createElement('div');
        card.className = 'file-card';

        let preview = '';

        if(file.category === 'images'){
            preview = `<img src="${file.data}" class="file-preview">`;
        }
        else if(file.category === 'videos'){
            preview = `
            <video class="file-preview" controls>
                <source src="${file.data}">
            </video>`;
        }
        else if(file.category === 'audio'){
            preview = `
            <audio controls style="width:100%;margin-bottom:10px;">
                <source src="${file.data}">
            </audio>`;
        }
        else{
            preview = `
            <div class="file-preview" style="display:flex;align-items:center;justify-content:center;font-size:60px;">
                📄
            </div>`;
        }

        const shareLink = generateShareLink(file.data, file.name);

        card.innerHTML = `
            ${preview}
            <div class="file-name">${file.name}</div>

            <input value="${shareLink}" readonly class="share-input">

            <div class="file-actions">
                <button class="download-btn" onclick="downloadFile('${file.data}','${file.name}')">
                    Télécharger
                </button>

                <button class="download-btn" onclick="copyLink('${shareLink}')">
                    Copier lien
                </button>

                <button class="delete-btn" onclick="deleteFile(${index})">
                    Supprimer
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    const totalMB = (totalSize / (1024*1024)).toFixed(2);

    document.getElementById('storageSize').innerHTML = totalMB + ' MB';

    let percent = Math.min((totalMB / 500) * 100,100);

    document.getElementById('storageFill').style.width = percent + '%';
}

function showCategory(category){
    currentCategory = category;
    renderFiles();
}

function deleteFile(index){
    filesData.splice(index,1);
    saveFiles();
    renderFiles();
}

function downloadFile(data,name){

    const a = document.createElement('a');
    a.href = data;
    a.download = name;
    a.click();
}

document.getElementById('fileInput').addEventListener('change', function(e){

    const files = e.target.files;

    Array.from(files).forEach(file=>{

        const reader = new FileReader();

        reader.onload = function(event){

            filesData.push({
                name:file.name,
                size:file.size,
                type:file.type,
                category:getCategory(file),
                data:event.target.result
            });

            saveFiles();
            renderFiles();
        }

        reader.readAsDataURL(file);
    });
});

window.onload = ()=>{

    const user = localStorage.getItem('cloudUser');

    if(user && users[user.toLowerCase()]){

        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('cloudApp').style.display = 'flex';

        document.getElementById('welcome').innerHTML = `Bienvenue ${user}`;

        loadFiles();
    }
}