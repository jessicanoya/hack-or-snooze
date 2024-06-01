"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  getHostName() {
    return new URL(this.url).host;
  }
}

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    const stories = response.data.stories.map((story) => new Story(story));
    return new StoryList(stories);
  }

  async addStory(user, { title, author, url }) {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {
        token: user.loginToken,
        story: {
          author,
          title,
          url,
        },
      },
    });

    const newStory = new Story(response.data.story);
    this.stories.push(newStory);
    return newStory;
  }
}

class User {
  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));
    this.loginToken = token;
  }

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavoriteStory(storyID) {
    await axios.post(
      `${BASE_URL}/users/${this.username}/favorites/${storyID}`,
      { token: this.loginToken }
    );

    const story = storyList.stories.find((s) => s.storyId === storyID);
    this.favorites.push(story);
  }

  async removeFavoriteStory(storyID) {
    await axios.delete(
      `${BASE_URL}/users/${this.username}/favorites/${storyID}`,
      { data: { token: this.loginToken } }
    );

    this.favorites = this.favorites.filter((s) => s.storyId !== storyID);
  }

  isFavorite(storyID) {
    return this.favorites.some((s) => s.storyId === storyID);
  }
}
