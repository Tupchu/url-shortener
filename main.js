import axios from "axios";

const linkForm = document.querySelector("#link-form");
const linkSubmissions = document.querySelector("#link-submissions");
const navItems = document.querySelector(".nav-items");
const menuIcon = document.querySelector(".menu-icon");
const urlInput = document.querySelector(".url-input");
const urlError = document.querySelector(".url-error");

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
    urlInput.classList.add("invalid-url");
    urlError.innerHTML = "Please add a URL";
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
    .catch(() => {
      urlInput.classList.add("invalid-url");
      urlError.innerHTML = "Something went wrong. Please try again later.";
    });
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

  urlInput.classList.remove("invalid-url");
  urlError.innerHTML = "";
}

function handleInvalidLink(errorCode) {
  urlInput.classList.add("invalid-url");
  if (errorCode === 1) {
    // invalid url
    urlError.innerHTML = "Please enter a valid URL";
  } else {
    urlError.innerHTML = "Something went wrong. Please try again later.";
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
      <button class="btn delete-btn">Delete</button>
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

  if (e.target.matches(".delete-btn")) {
    const submissions = JSON.parse(localStorage.getItem("linkSubmissions"));
    const url =
      e.target.previousElementSibling.previousElementSibling.innerHTML;

    localStorage.setItem(
      "linkSubmissions",
      JSON.stringify(
        submissions.filter((submission) => submission.shorturl !== url)
      )
    );

    e.target.parentElement.parentElement.remove();
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
