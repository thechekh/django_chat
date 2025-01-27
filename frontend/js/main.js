const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.getElementById("nav-links");

    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="profile.html">Profile</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" id="logout">Logout</a>
            </li>`;

        document.getElementById("logout")?.addEventListener("click", () => {
            logout();
        });
    } else {
        navLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="signup.html">Sign Up</a>
            </li>`;
    }
});

function logout() {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (refreshToken) {
        fetch(`${API_BASE_URL}/logout/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: refreshToken }),
        })
            .then(response => {
                if (response.ok) {
                    sessionStorage.removeItem("accessToken");
                    sessionStorage.removeItem("refreshToken");
                    window.location.href = "index.html";
                } else {
                    console.error("Failed to logout");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    } else {
        console.error("No refresh token found");
    }
}