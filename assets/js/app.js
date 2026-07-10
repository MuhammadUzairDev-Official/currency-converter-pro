/* =====================================
   Currency Converter Pro
   Author: Muhammad Uzair
===================================== */

/* ==========================
   DOM Elements
========================== */

const amount = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");

const result = document.getElementById("result");
const rate = document.getElementById("rate");
const updated = document.getElementById("updated");

const themeBtn = document.getElementById("themeBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

/* ==========================
   Global Variables
========================== */

let fromSelect;
let toSelect;

/* ==========================
   Theme
========================== */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add("light-mode");
    themeBtn.textContent = "☀️";

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {

        localStorage.setItem("theme", "light");
        themeBtn.textContent = "☀️";

    }

    else {

        localStorage.setItem("theme", "dark");
        themeBtn.textContent = "🌙";

    }

});

/* ==========================
   Toast
========================== */

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },2500);

}

/* ==========================
   Load Currency List
========================== */

async function loadCurrencies(){

    try{

        const response = await fetch(
            "https://open.er-api.com/v6/latest/USD"
        );

        const data = await response.json();

        if(data.result!=="success"){

            throw new Error();

        }

        const currencyList =
        Object.keys(data.rates).sort();

        currencyList.forEach(currency=>{

            fromCurrency.add(
                new Option(currency,currency)
            );

            toCurrency.add(
                new Option(currency,currency)
            );

        });
fromSelect = new TomSelect("#fromCurrency", {

    create: false,

    maxOptions: 300,

    placeholder: "🔍 Search Currency...",

    searchField: ["text", "value"],

    sortField: {
        field: "text",
        direction: "asc"
    },

    highlight: true,

    openOnFocus: true,

    closeAfterSelect: true

});

toSelect = new TomSelect("#toCurrency", {

    create: false,

    maxOptions: 300,

    placeholder: "🔍 Search Currency...",

    searchField: ["text", "value"],

    sortField: {
        field: "text",
        direction: "asc"
    },

    highlight: true,

    openOnFocus: true,

    closeAfterSelect: true

});

        fromSelect.setValue("USD");

        if(currencyList.includes("PKR")){

            toSelect.setValue("PKR");

        }

        else{

            toSelect.setValue(currencyList[0]);

        }

    }

    catch(error){

        console.error(error);

        showToast("Unable to load currencies.");

    }

}
/* ==========================
   Convert Currency
========================== */

async function convertCurrency() {

    if (!fromSelect || !toSelect) return;

    const from = fromSelect.getValue();
    const to = toSelect.getValue();
    const amountValue = Number(amount.value);

    if (isNaN(amountValue) || amountValue <= 0) {

        showToast("Please enter a valid amount.");
        amount.focus();
        return;

    }

    result.textContent = "Loading...";
    rate.textContent = "Fetching latest exchange rate...";
    updated.textContent = "";

    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";

    try {

        const response = await fetch(
            `https://open.er-api.com/v6/latest/${from}`
        );

        const data = await response.json();

        if (data.result !== "success") {

            throw new Error("API Error");

        }

        const exchangeRate = data.rates[to];

        const converted = amountValue * exchangeRate;

        result.textContent =
            `${converted.toFixed(2)} ${to}`;

        rate.textContent =
            `1 ${from} = ${exchangeRate.toFixed(4)} ${to}`;

        updated.textContent =
            `Last Updated : ${new Date().toLocaleString()}`;

        saveHistory(
            amountValue,
            from,
            to,
            converted.toFixed(2)
        );

    }

    catch (error) {

        console.error(error);

        result.textContent = "Error";

        rate.textContent =
            "Unable to fetch exchange rate.";

        updated.textContent =
            "Check your internet connection.";

        showToast("Exchange Rate API Error");

    }

    finally {

        convertBtn.disabled = false;
        convertBtn.textContent =
            "💱 Convert Currency";

    }

}


/* ==========================
   Save History
========================== */

function saveHistory(amountValue, from, to, resultValue) {

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({

        amount: amountValue,

        from: from,

        to: to,

        result: resultValue,

        time: new Date().toLocaleString()

    });

    if (history.length > 10) {

        history.pop();

    }

    localStorage.setItem(

        "history",

        JSON.stringify(history)

    );

    loadHistory();

}


/* ==========================
   Load History
========================== */

function loadHistory() {

    if (!historyList) return;

    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML =
            "<p>No History Yet</p>";

        return;

    }

    history.forEach(item => {

        const div = document.createElement("div");

        div.className = "history-item";

        div.innerHTML = `

            <strong>${item.amount} ${item.from}</strong>

            <br>

            ↓

            <br>

            <strong>${item.result} ${item.to}</strong>

            <br>

            <small>${item.time}</small>

        `;

        historyList.appendChild(div);

    });

}


/* ==========================
   Clear History
========================== */

if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener("click", () => {

        localStorage.removeItem("history");

        loadHistory();

        showToast("History Cleared");

    });

}
/* ==========================
   Convert Button
========================== */

convertBtn.addEventListener("click", convertCurrency);


/* ==========================
   Swap Currency
========================== */

swapBtn.addEventListener("click", () => {

    if (!fromSelect || !toSelect) return;

    const from = fromSelect.getValue();
    const to = toSelect.getValue();

    fromSelect.setValue(to);
    toSelect.setValue(from);

    if (Number(amount.value) > 0) {

        convertCurrency();

    }

});


/* ==========================
   Auto Convert
========================== */

function registerEvents() {

    fromSelect.on("change", () => {

        if (Number(amount.value) > 0) {

            convertCurrency();

        }

    });

    toSelect.on("change", () => {

        if (Number(amount.value) > 0) {

            convertCurrency();

        }

    });

}


/* ==========================
   Enter Key
========================== */

amount.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        convertCurrency();

    }

});


/* ==========================
   Copy Result
========================== */

copyBtn.addEventListener("click", async () => {

    if (

        result.textContent === "0.00" ||
        result.textContent === "Loading..." ||
        result.textContent === "Error"

    ) {

        showToast("Nothing to copy.");

        return;

    }

    try {

        await navigator.clipboard.writeText(

            result.textContent

        );

        showToast("✅ Result Copied");

    }

    catch (error) {

        console.error(error);

        showToast("Copy Failed");

    }

});


/* ==========================
   Initialize App
========================== */

async function init() {

    await loadCurrencies();

    registerEvents();

    loadHistory();

    convertCurrency();

}

init();