"use strict";

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $submitForm = $("#submit-form");
const $navSubmitStory = $("#nav-submit-story");

const $favoritedStories = $("#favorited-stories");
const $navFavorites = $("#nav-favorites");

const $ownStories = $("#my-stories");

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $submitForm,
    $favoritedStories,
  ];
  components.forEach((c) => c.hide());
}

async function start() {
  console.debug("start");

  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  if (currentUser) updateUIOnUserLogin();
}

$(start);
