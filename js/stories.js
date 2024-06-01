"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  // if a user is logged in, show favorite/not-favorite star
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

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
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

/** Make favorite/not-favorite star for story */

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
