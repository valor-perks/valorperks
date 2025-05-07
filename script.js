// Reveal animation
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
});
reveals.forEach(el => observer.observe(el));

function toggleForm() {
  document.querySelectorAll(".form-box").forEach(form => {
    form.classList.toggle("hidden");
    form.classList.toggle("active");
  });
}

// Mobile menu toggle
const hamburger = document.getElementById('hamburger-icon');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

// Dropdown toggle
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent link default behavior
    const dropdown = this.nextElementSibling;

    // Close other open dropdowns (optional)
    document.querySelectorAll('.dropdown-content').forEach(menu => {
      if (menu !== dropdown) {
        menu.classList.remove('show');
      }
    });

    // Toggle current dropdown
    dropdown.classList.toggle('show');
  });
});


// Close dropdown when clicking outside
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

document.addEventListener('click', function (e) {
  if (dropdown && dropdownContent && !dropdown.contains(e.target)) {
    dropdownContent.classList.remove('show');
  }
});

// Typing animation
document.addEventListener("DOMContentLoaded", () => {
  const words = [
    "Earn Online. Effortlessly.",
    "Trade Tokens. Make Money.",
    "No Crypto Confusion. Just Rewards."
  ];

  let i = 0, j = 0, isDeleting = false;
  const el = document.getElementById("typing-text");

  function type() {
    const current = words[i];
    el.textContent = current.substring(0, j);

    if (!isDeleting && j < current.length) {
      j++;
    } else if (isDeleting && j > 0) {
      j--;
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) i = (i + 1) % words.length;
    }

    setTimeout(type, isDeleting ? 50 : 120);
  }

  if (el) type();
});

// Automatically update the year in the footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// FAQ toggle
document.querySelectorAll(".faq-question").forEach(question => {
  question.addEventListener("click", () => {
    let answer = question.nextElementSibling;
    answer.style.display = answer.style.display === "block" ? "none" : "block";
  });
});

// Modal popups
const signupModal = document.getElementById('signupModal');
const loginModal = document.getElementById('loginModal');
const openSignup = document.getElementById('openSignup');
const openLogin = document.getElementById('openLogin');

function showModal(modal) {
  modal.classList.add("active");
}

function hideModal(modal) {
  modal.classList.remove("active");
}

// Open Modals
openSignup.addEventListener("click", (e) => { e.preventDefault(); showModal(signupModal); });
openLogin.addEventListener("click", (e) => { e.preventDefault(); showModal(loginModal); });

// Close Modals
window.addEventListener('click', (e) => {
  if (e.target === signupModal) hideModal(signupModal);
  if (e.target === loginModal) hideModal(loginModal);
});

function signIn() {
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      let user = userCredential.user;

      // Fetching user data from Firestore
      firebase.firestore().collection("Users").doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            let userData = doc.data();
            alert(`Login successful! Welcome back, ${userData.email}`);

            // Redirect to the dashboard or another page
            window.location.href = "dashboard.html";  // Ensure this URL is correct

            // You can also update the dashboard or other elements as needed
            updateDashboard(userData.balance, userData.referralEarnings);
          } else {
            console.error("No user data found.");
          }
        });
    }).catch(error => alert(error.message));
}

document.getElementById("signupBtn").addEventListener("click", signUp);
document.getElementById("loginBtn").addEventListener("click", signIn);

document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  // You can add validation or send the form data to a backend here

  // Simulate message sent
  document.getElementById("formMessage").style.display = "block";

  // Optionally reset the form
  this.reset();
});

// Resend Verification Email
document.getElementById('resendVerificationBtn').addEventListener('click', function() {
  let user = firebase.auth().currentUser;

  if (user) {
    user.sendEmailVerification()
      .then(() => {
        alert("Verification email resent! Please check your inbox.");
      })
      .catch(error => {
        console.error("Error resending verification email:", error);
        alert("Failed to resend verification email.");
      });
  } else {
    alert("Please log in first to request a verification email.");
  }
});
