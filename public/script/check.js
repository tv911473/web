let fileSizeLimit = 1.5 * 1024 * 1024;

window.onload = function(){
    document.querySelector("#photoSubmit").disabled = true;
    document.querySelector("#checkInfo").innerHTML = "No photo selected";
    document.querySelector("#photoInput").addEventListener("change", checkFileSize);
}

function checkFileSize(){
    if (document.querySelector("#photoInput").files[0].size <= fileSizeLimit){
        document.querySelector("#photoSubmit").disabled = false;
        document.querySelector("#checkInfo").innerHTML = "";
    } else {
        document.querySelector("#photoSubmit").disabled = true;
        document.querySelector("#checkInfo").innerHTML = "File size over 1,5MB!";
    }
}