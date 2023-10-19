import axios from "axios";

const linkForm = document.querySelector("#link-form");
const linkSubmissions = document.querySelector("#link-submissions");
const navItems = document.querySelector(".nav-items");
const menuIcon = document.querySelector(".menu-icon");

// handle mobile navigation
menuIcon.addEventListener("click", () => {
  navItems.classList.toggle("active");
  menuIcon.classList.toggle("active");
});

// shorten url form event
linkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(linkForm);
  const url = formData.get("link");

  if (url === "") {
    return;
  }

  getShortLink(url);
  linkForm.reset();
});

function getShortLink(url) {
  return axios
    .get(`https://is.gd/create.php?url=${url}&format=json`)
    .then((res) =>
      res.data.shorturl
        ? handleLinkSuccess(url, res.data.shorturl)
        : handleInvalidLink(res.data.errorcode)
    )
    .catch((err) => console.log(err));
}

function handleLinkSuccess(url, shorturl) {
  const submissions = localStorage.getItem("linkSubmissions");
  let parsedSubmissions = [];

  if (submissions === null) {
    localStorage.setItem(
      "linkSubmissions",
      JSON.stringify([{ url, shorturl }])
    );
  } else {
    parsedSubmissions = JSON.parse(submissions);
    parsedSubmissions.push({ url, shorturl });
    localStorage.setItem("linkSubmissions", JSON.stringify(parsedSubmissions));
  }

  linkSubmissions.insertAdjacentHTML(
    "afterbegin",
    addLinkSubmission(url, shorturl)
  );
}

function handleInvalidLink(errorCode) {
  if (errorCode === 1) {
    // invalid url
  }
}

(function loadSubmissions() {
  // load submissions from local storage
  const submissions = localStorage.getItem("linkSubmissions");

  if (submissions !== null) {
    JSON.parse(submissions).forEach((submission) => {
      linkSubmissions.insertAdjacentHTML(
        "afterbegin",
        addLinkSubmission(submission.url, submission.shorturl)
      );
    });
  }
})();

function addLinkSubmission(url, shorturl) {
  return `        
  <div class="submission">
    <p class="original-url">${url}</p>
    <hr />
    <div class="copy-container">
      <p class="shortened-url">${shorturl}</p>
      <button class="btn copy-btn">Copy</button>
    </div>
  </div>
`;
}

linkSubmissions.addEventListener("click", (e) => {
  if (e.target.matches(".copy-btn")) {
    navigator.clipboard.writeText(e.target.previousElementSibling.innerHTML);

    removeFromClipboard();

    // update UI to show copied status
    e.target.classList.add("copied");
    e.target.innerHTML = "Copied!";
  }
});

function removeFromClipboard() {
  // reset copied status on previously clicked elements
  const copyUrlBtn = document.querySelectorAll(".copy-btn");
  copyUrlBtn.forEach((btn) => {
    btn.classList.remove("copied");
    btn.innerHTML = "Copy!";
  });
}
