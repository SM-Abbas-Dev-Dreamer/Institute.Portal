"use client";
import React from "react";
import "./Timetable.css";

const Timetable = () => {
  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Weekly School Timetable</h1>
          <p>
            Top row = Time (hours). First column = Days. Pure HTML + CSS UI
            focused on clarity.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
            Grade: <strong style={{ color: "#fff" }}>10</strong>
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
            Week: <strong style={{ color: "#fff" }}>Mon — Fri</strong>
          </div>
        </div>
      </header>

      <div className="table-wrap">
        <table className="timetable" role="table" aria-label="Weekly timetable">
          <thead>
            <tr>
              <th style={{ minWidth: "140px" }}>Days / Time</th>
              <th>08:00 - 09:00</th>
              <th>09:00 - 10:00</th>
              <th>10:00 - 11:00</th>
              <th>11:00 - 12:00</th>
              <th>12:00 - 13:00</th>
              <th>13:30 - 14:30</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Monday</th>
              <td data-sub="math">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Mathematics</div>
                  <div className="meta">Room 201 — Mr. Khan</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">English</div>
                  <div className="meta">Room 102 — Ms. Sara</div>
                </div>
              </td>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Physics</div>
                  <div className="meta">Lab A — Mr. Ali</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Break</div>
              </td>
              <td data-sub="isl">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Islamiat</div>
                  <div className="meta">Room 105 — Mrs. Ahmed</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Computer</div>
                  <div className="meta">Room 305 — Lab</div>
                </div>
              </td>
            </tr>

            <tr>
              <th>Tuesday</th>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">English</div>
                  <div className="meta">Room 102 — Ms. Sara</div>
                </div>
              </td>
              <td data-sub="math">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Mathematics</div>
                  <div className="meta">Room 201 — Mr. Khan</div>
                </div>
              </td>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Chemistry</div>
                  <div className="meta">Lab B — Mrs. Rizvi</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Assembly</div>
              </td>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Biology</div>
                  <div className="meta">Room 204 — Ms. Noor</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Sports</div>
              </td>
            </tr>

            <tr>
              <th>Wednesday</th>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Physics</div>
                  <div className="meta">Lab A — Mr. Ali</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">English</div>
                  <div className="meta">Room 102 — Ms. Sara</div>
                </div>
              </td>
              <td data-sub="math">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Mathematics</div>
                  <div className="meta">Room 201 — Mr. Khan</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Break</div>
              </td>
              <td data-sub="isl">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Islamic Studies</div>
                  <div className="meta">Room 105 — Mrs. Ahmed</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Computer</div>
                  <div className="meta">Room 305 — Lab</div>
                </div>
              </td>
            </tr>

            <tr>
              <th>Thursday</th>
              <td data-sub="isl">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Islamiat</div>
                  <div className="meta">Room 105 — Mrs. Ahmed</div>
                </div>
              </td>
              <td data-sub="math">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Mathematics</div>
                  <div className="meta">Room 201 — Mr. Khan</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">English</div>
                  <div className="meta">Room 102 — Ms. Sara</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Break</div>
              </td>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Chemistry</div>
                  <div className="meta">Lab B — Mrs. Rizvi</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Club Activity</div>
              </td>
            </tr>

            <tr>
              <th>Friday</th>
              <td data-sub="math">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Mathematics</div>
                  <div className="meta">Room 201 — Mr. Khan</div>
                </div>
              </td>
              <td data-sub="sci">
                <div className="lesson" tabIndex="0">
                  <div className="subject">Physics</div>
                  <div className="meta">Lab A — Mr. Ali</div>
                </div>
              </td>
              <td data-sub="eng">
                <div className="lesson" tabIndex="0">
                  <div className="subject">English</div>
                  <div className="meta">Room 102 — Ms. Sara</div>
                </div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Break</div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Revision</div>
              </td>
              <td data-sub="free">
                <div className="lesson" tabIndex="0">Dismissal</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="legend">
        <div className="item">
          <span className="dot" style={{ background: "linear-gradient(180deg,#a78bfa,#7c3aed)" }}></span>
          Mathematics
        </div>
        <div className="item">
          <span className="dot" style={{ background: "linear-gradient(180deg,#67e8f9,#06b6d4)" }}></span>
          English / Computer
        </div>
        <div className="item">
          <span className="dot" style={{ background: "linear-gradient(180deg,#34d399,#059669)" }}></span>
          Science
        </div>
        <div className="item">
          <span className="dot" style={{ background: "linear-gradient(180deg,#fb923c,#f97316)" }}></span>
          Islamiat
        </div>
        <div className="item">
          <span className="dot" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}></span>
          Break / Free
        </div>
      </div>
    </div>
  );
};

export default Timetable;
