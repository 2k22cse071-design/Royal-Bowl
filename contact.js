async function sendMsg(event) {
    event.preventDefault();

    const name = document.querySelector(".contact-form input[type='text']").value;
    const email = document.querySelector(".contact-form input[type='email']").value;
    const message = document.querySelector(".contact-form textarea").value;

    
const response = await fetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message })
});

    const data = await response.json();
    if (data.success) {
        alert("Message Sent Successfully!");
    } else {
        alert("Failed to send message!");
    }
}
