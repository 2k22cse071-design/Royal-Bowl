async function addTransaction(event) {
  event.preventDefault();

  const date = document.getElementById("date").value;
  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value;
  const type = document.getElementById("type").value;

  const response = await fetch("http://localhost:3000/add-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, amount, description, type }),
  });

  const data = await response.json();
  if (data.success) {
    alert("Transaction added successfully!");
  } else {
    alert("Failed to add transaction!");
  }
}
