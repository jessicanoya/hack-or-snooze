"use strict";

let storyList;

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

function generateStoryMarkup(story) {
  const showStar = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`
    <li id="${story.storyId}">
       <div>
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function handleSubmitNewStory(evt) {
  console.debug("handleSubmitNewStory", evt);
  evt.preventDefault();

  const title = $("#create-title").val();
  const author = $("#create-author").val();
  const url = $("#create-url").val();

  const newStory = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });

  const $newStoryMarkup = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStoryMarkup);

  $("#submit-form").trigger("reset");
  $submitForm.slideUp("slow");
  $allStoriesList.show();
}

$("#submit-form").on("submit", handleSubmitNewStory);

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story.storyId);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star" data-story-id="${story.storyId}">
        <i class="${starType} fa-star"></i>
      </span>`;
}

$allStoriesList.on("click", ".star", async function () {
  const storyID = $(this).closest("li").attr("id");
  if ($(this).children("i").hasClass("fas")) {
    await currentUser.removeFavoriteStory(storyID);
    $(this).children("i").toggleClass("fas far");
  } else {
    await currentUser.addFavoriteStory(storyID);
    $(this).children("i").toggleClass("fas far");
  }
});

function markFavorites() {
  for (let story of storyList.stories) {
    if (currentUser.isFavorite(story.storyId)) {
      $(`#${story.storyId} .star`).removeClass("far").addClass("fas");
    }
  }
}

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}
