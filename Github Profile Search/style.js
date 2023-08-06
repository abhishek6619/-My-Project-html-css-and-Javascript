const searchBtn = document.querySelector('#search-btn');
const searchInput = document.querySelector('#input-box');
const btnContainer = document.querySelectorAll('.btn-container button');
const userImg = document.querySelector('.user-img img');
const name = document.querySelector('.name h2');
const userName = document.querySelector('.user-name h2');
const bio = document.querySelector('.bio p');
const followers = document.querySelector('#followers');
const following = document.querySelector('#following');
const repo = document.querySelector('#repo');
const repositoryContainer = document.querySelector('.repository-container');
const followersSection = document.querySelector('.followers-section');
const followingSection = document.querySelector('.following-section');
const backBtn = document.querySelector('.back-btn');

const APIURL = "https://api.github.com/users/";

const loadingSpinner = document.querySelector('.loading-spinner');

let usersHistory = []; // Array to store the user search history

const getUser = async (username) => {
    loadingSpinner.style.display = 'flex'; // Show the loading spinner
    document.querySelector('.container').style.display = 'none';

    if (username.length < 1) {
        if (userImg.src) {
            document.querySelector('.container').style.display = 'flex';
        }
        loadingSpinner.style.display = 'none'; // Hide the loading spinner
        return;
    }

    const response = await fetch(APIURL + username);

    if (response.status === 404) {
        loadingSpinner.style.display = 'none'; // Hide the loading spinner
        if (!userImg.src || userImg.src === 'undefined') {
            document.querySelector('.container').style.display = 'none';
        } else {
            document.querySelector('.container').style.display = 'flex'; // Show the information container
        }
        alert('User not found. Please enter a valid username.');
        return;
    }

    const data = await response.json();
    console.log(data);

    // Update user data in localStorage
    localStorage.setItem('currentUsername', username);

    // Update userImg and userName elements with the retrieved data
    userImg.src = data.avatar_url;
    name.textContent = data.name;
    userName.textContent = data.login;
    bio.textContent = data.bio;
    followers.textContent = data.followers;
    following.textContent = data.following;
    repo.textContent = data.public_repos;
    document.querySelector('.open-profile').href = data.html_url;

    // Clear previous repository and followers/following data
    repositoryContainer.style.display = 'block';
    followersSection.style.display = 'none';
    followingSection.style.display = 'none';

    // Fetch repository data
    const repoResponse = await fetch(data.repos_url);
    const repoData = await repoResponse.json();

    const repoLength = document.createElement('h1');
    repoLength.classList.add('repoLength');
    repoLength.textContent = `Repository (${repoData.length})`;
    repositoryContainer.innerHTML = '';
    repositoryContainer.appendChild(repoLength);

    // Iterate over the repositories and create repository elements
    repoData.forEach((repo) => {
        const repoElement = document.createElement('div');
        repoElement.classList.add('repository');

        const repoName = document.createElement('h3');
        const repoNameLink = document.createElement('a');
        repoNameLink.textContent = repo.name;
        repoNameLink.href = repo.html_url;
        repoNameLink.target = '_blank';
        repoName.appendChild(repoNameLink);

        const repoDescription = document.createElement('p');
        repoDescription.textContent = repo.description;

        const repoLanguage = document.createElement('span');
        repoLanguage.textContent = repo.language;

        repoElement.appendChild(repoName);
        repoElement.appendChild(repoDescription);
        repoElement.appendChild(repoLanguage);

        repositoryContainer.appendChild(repoElement);
    });

    loadingSpinner.style.display = 'none'; // Hide the loading spinner
    document.querySelector('.container').style.display = 'flex'; // Show the information container
};

const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

// Fetch followers and following data
const fetchFollowersFollowingData = async (title, container) => {
    const url = `${APIURL}${localStorage.getItem('currentUsername').trim()}/${title}`;
    const containerData = await fetchData(url);
    console.log(containerData);

    container.style.display = 'block';
    container.innerHTML = '';
    const titleElement = document.createElement('h1');
    titleElement.classList.add('repoLength');
    titleElement.textContent = `${title.charAt(0).toUpperCase() + title.slice(1)} (${containerData.length})`;
    container.appendChild(titleElement);

    const usersList = document.createElement('ul');
    containerData.forEach((user) => {
        const userItem = document.createElement('li');
        const userLink = document.createElement('a');
        const userImg = document.createElement('img');
        const Name = document.createElement('h2');

        userLink.setAttribute('data-username', user.login);

        userLink.href = user.html_url;
        userLink.target = '_blank';
        userImg.src = user.avatar_url;
        Name.textContent = user.login;

        userLink.appendChild(userImg);
        userItem.appendChild(userLink);
        userItem.appendChild(Name);
        usersList.appendChild(userItem);

        userLink.addEventListener('click', (event) => {
            event.preventDefault();
            const username = event.currentTarget.getAttribute('data-username');
            backBtn.style.display = 'block';
            navigateToUser(username);
        });
    });

    container.appendChild(usersList);
};

btnContainer.forEach((btn) => {
    btn.addEventListener('click', () => {
        btnContainer.forEach((btn) => btn.classList.remove('btn-active'));
        btn.classList.add('btn-active');

        const btnText = btn.textContent.toLowerCase();
        if (btnText === 'repository') {
            repositoryContainer.style.display = 'block';
            followersSection.style.display = 'none';
            followingSection.style.display = 'none';
        } else if (btnText === 'followers') {
            fetchFollowersFollowingData('followers', followersSection);
            repositoryContainer.style.display = 'none';
            followingSection.style.display = 'none';
            followersSection.style.display = 'block';
        } else if (btnText === 'following') {
            fetchFollowersFollowingData('following', followingSection);
            repositoryContainer.style.display = 'none';
            followersSection.style.display = 'none';
            followingSection.style.display = 'block';
        }
    });
});

const navigateToUser = (username) => {
    usersHistory.push(username);
    localStorage.setItem('usersHistory', JSON.stringify(usersHistory));
    getUser(username);
    updateBackButtonVisibility();
};

const updateBackButtonVisibility = () => {
    if (usersHistory.length > 1) {
        backBtn.style.display = 'block';
    } else {
        backBtn.style.display = 'none';
    }
};

backBtn.addEventListener('click', () => {
    usersHistory.pop();
    localStorage.setItem('usersHistory', JSON.stringify(usersHistory));
    const previousUsername = usersHistory[usersHistory.length - 1];
    getUser(previousUsername);
    updateBackButtonVisibility();
});

// Check if user data exists in localStorage on page load
if (localStorage.getItem('currentUsername')) {
    const username = localStorage.getItem('currentUsername');
    navigateToUser(username);
} else {
    updateBackButtonVisibility();
}

searchBtn.addEventListener('click', () => {
    const username = searchInput.value.trim();
    navigateToUser(username);
});

// Retrieve user history from localStorage on page load
if (localStorage.getItem('usersHistory')) {
    usersHistory = JSON.parse(localStorage.getItem('usersHistory'));
    updateBackButtonVisibility();
}





// edit profile
const editProfileBtn = document.querySelector('#edit-profile-btn');

editProfileBtn.addEventListener('click', async () => {
    // Prompt the user to enter the new profile information
    const accessToken = prompt('Enter your access token:');
    const newName = prompt('Enter your new name:');
    const newBio = prompt('Enter your new bio:');

    if (accessToken && newName !== null && newBio !== null) {
        try {
            // Send the PATCH request to update the profile
            const response = await fetch(APIURL, {
                method: 'PATCH',
                headers: {
                    Authorization: `token ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newName,
                    bio: newBio
                })
            });

            if (response.ok) {
                // Update the profile data on success
                const data = await response.json();
                name.textContent = data.name;
                bio.textContent = data.bio;
                alert('Profile updated successfully!');
            } else {
                // Display an error message if the request fails
                alert('Failed to update profile. Please check your access token and try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    }
});



// Dark mode functionality
const darkModeBtn = document.querySelector('.dark-mode-icon');
let darkMode = localStorage.getItem('darkMode');

// Check if dark mode is enabled in localStorage
if (darkMode === 'true') {
    document.body.classList.add('dark-theme');
}

darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    darkMode = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkMode', darkMode);
});