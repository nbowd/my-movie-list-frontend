import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { Link } from "react-router-dom";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import BallotIcon from "@mui/icons-material/Ballot";
import ForumIcon from "@mui/icons-material/Forum";
import SearchIcon from "@mui/icons-material/Search";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import axios from "axios";

const TOKEN = window.localStorage.getItem("token");

type Section = "dashboard" | "users" | "watchlists" | "comments";

interface CommentData {
  commentId: string;
  comment: string;
  datePosted: string;
  userId: string;
  username: string;
  watchlistId: string;
  watchlistName: string;
}

interface UserData {
  username: string;
  email: string;
  biography: string;
  preferredGenres: string[];
  friends: string[];
  signedUrl: string;
  userId: string;
  isBanned: boolean;
}

interface WatchlistData {}

function dashboard() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistData[]>([]);
  const [section, setSection] = useState<Section>("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commentsRes, usersRes, watchlistRes] = await Promise.all([
          axios.get("http://localhost:3000/watchlist/comments/all", {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }),
          axios.get("http://localhost:3000/users/users", {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }),
          axios.get("http://localhost:3000/watchlist", {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }),
        ]);

        setComments(commentsRes.data);
        setUsers(usersRes.data);
        setWatchlists(watchlistRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleBanToggle = async (
    userId: string,
    isCurrentlyBanned: boolean
  ) => {
    try {
      const banStatus = isCurrentlyBanned ? "unbanned" : "banned";
      await axios.patch(
        `http://localhost:3000/users/${userId}/ban-status`,
        { status: banStatus },
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      // Update user state locally after ban/unban
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? { ...user, isBanned: !isCurrentlyBanned }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to toggle ban:", error);
    }
  };

  const handleDeleteComment = async (listId: string, commentId: string) => {
    try {
      await axios.put(
        `http://localhost:3000/watchlist/${listId}/comments/${commentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      // Remove the comment from state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <>
      <div className="dashboard">
        <div className="sidebar">
          <div className="logo">
            <MovieFilterIcon className="logo-icon" />
            <h2>My Movie List</h2>
          </div>
          <div className="menu">
            <div className="item" onClick={() => setSection("dashboard")}>
              <HomeIcon className="icon" />
              Dashboard
            </div>
            <div className="item" onClick={() => setSection("users")}>
              <GroupIcon className="icon" />
              Users
            </div>
            <div className="item" onClick={() => setSection("watchlists")}>
              <BallotIcon className="icon" />
              Watchlists
            </div>
            <div className="item" onClick={() => setSection("comments")}>
              <ForumIcon className="icon" />
              Comments
            </div>
          </div>
        </div>

        <div className="main">
          <div className="main-header">
            <h1 className="header-title">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </h1>
            <div className="header-activity">
              <div className="search-box">
                <input type="text" placeholder="Search..." />
                <SearchIcon className="icon" />
              </div>
            </div>
          </div>
          <div className="main-content">
            {section === "dashboard" && (
              <div className="dashboard-widgets">
                <div className="content-users-watchlists">
                  <div className="content-users">
                    <div className="content-title">Users</div>
                    <div className="users-list">
                      {users.slice(0, 3).map((item) => (
                        <div className="user-item" key={item.userId}>
                          <div className="user-display">
                            <img
                              src={
                                item.signedUrl
                                  ? item.signedUrl
                                  : "/src/assets/Images/default-profile.jpg"
                              }
                              alt="user photo"
                            />
                          </div>
                          <div className="user-username">{item.username}</div>
                        </div>
                      ))}
                      <div className="view-more">
                        <div
                          className="view-more-link"
                          style={{ cursor: "pointer", color: "#526d82" }}
                          onClick={() => setSection("users")}
                        >
                          View More →
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-watchlists">watchlists</div>
                </div>
                <div className="content-comments">
                  <div className="content-title">Comments</div>
                  <div className="list-container">
                    {comments.slice(0, 4).map((item) => (
                      <div className="comment-item" key={item.commentId}>
                        <div className="comment--content">
                          <div className="comment--title">
                            {new Date(item.datePosted).toLocaleString()} by{" "}
                            <Link to="">{item.username}</Link> on{" "}
                            <Link to="">{item.watchlistName}</Link>
                          </div>
                          <div className="comment--text">{item.comment}</div>
                        </div>
                        <div className="comment--buttons">
                          <DeleteForeverIcon
                            style={{
                              fontSize: 30,
                              marginRight: "4px",
                              color: "e74c3c",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this comment?"
                                )
                              ) {
                                handleDeleteComment(
                                  item.watchlistId,
                                  item.commentId
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="comment-view-more">
                      <div
                        className="view-more-link"
                        style={{ cursor: "pointer", color: "#526d82" }}
                        onClick={() => setSection("comments")}
                      >
                        View More →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section === "users" && (
              <div className="content-users-all">
                <div className="content-title">Users</div>
                <div className="users-list-all">
                  {users.map((item) => (
                    <div className="user-item" key={item.userId}>
                      <div className="user-display">
                        <img
                          src={
                            item.signedUrl ||
                            "/src/assets/Images/default-profile.jpg"
                          }
                          alt="user photo"
                          className="user-photo"
                        />
                      </div>
                      <div className="user-details">
                        <p>
                          <strong>Username:</strong> {item.username}
                        </p>
                        <p>
                          <strong>Email:</strong> {item.email}
                        </p>
                        <p>
                          <strong>Bio:</strong> {item.biography || "N/A"}
                        </p>
                        <p>
                          <strong>Genres:</strong>{" "}
                          {item.preferredGenres.length > 0
                            ? item.preferredGenres.join(", ")
                            : "None"}
                        </p>
                        <p>
                          <strong>Banned:</strong>{" "}
                          {item.isBanned ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Friends:</strong>{" "}
                          {item.friends ? item.friends.length : "None"}
                        </p>
                      </div>
                      <div className="user-actions">
                        <button
                          className={item.isBanned ? "unban-btn" : "ban-btn"}
                          onClick={() =>
                            handleBanToggle(item.userId, item.isBanned)
                          }
                        >
                          {item.isBanned ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "watchlists" && (
              <div className="content-watchlists-all">
                <div className="content-title">Watchlists</div>
                <p>Watchlist content goes here</p>
              </div>
            )}

            {section === "comments" && (
              <div className="content-comments-all">
                <div className="content-title">Comments</div>
                <div className="comments-list-all">
                  {comments.map((item) => (
                    <div className="comment-item" key={item.commentId}>
                      <div className="comment--content">
                        <div className="comment--title">
                          {new Date(item.datePosted).toLocaleString()} by{" "}
                          <Link to="">{item.username}</Link> on{" "}
                          <Link to="">{item.watchlistName}</Link>
                        </div>
                        <div className="comment--text">{item.comment}</div>
                      </div>
                      <div className="comment--buttons">
                        <DeleteForeverIcon
                          style={{
                            fontSize: 30,
                            marginRight: "4px",
                            color: "#e74c3c",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this comment?"
                              )
                            ) {
                              handleDeleteComment(
                                item.watchlistId,
                                item.commentId
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile">
          <div className="profile-header">
            Profile
          </div>
        </div>
      </div>
    </>
  );
}

export default dashboard;
