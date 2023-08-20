import axiosInstance from "../config/axios";
import express, { Request, Response, NextFunction, query } from "express";
import asyncHandler from "express-async-handler";
import { requestResponse } from "../types";

interface playlistUpdateResponse {
  snapshotId?: string;
  error?: string;
}

export const createPlaylist = async (userId: string, accessToken: string) => {
  const response = await axiosInstance.post(
    `v1/users/${userId}/playlists`,
    {
      name: "Queue App Name",
      description: "Playlist created by Queue App",
      public: false,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { playlistId: response.data.id, playlistUri: response.data.uri };
  }
};

export const removePlaylist = async (
  playlistId: string,
  accessToken: string
): Promise<requestResponse> => {
  const response = await axiosInstance.delete(
    `v1/playlists/${playlistId}/followers`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { success: true };
  }
};

export const addSongToPlaylist = async (
  playlistId: string,
  songUri: string,
  accessToken: string
): Promise<playlistUpdateResponse> => {
  const response = await axiosInstance.post(
    `v1/playlists/${playlistId}/tracks?uris=${songUri}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { snapshotId: response.data.snapshot_id };
  }
};

export const removeSongFromPlaylist = async (
  playlistId: string,
  songUri: string,
  accessToken: string
): Promise<playlistUpdateResponse> => {
  const response = await axiosInstance.delete(
    `v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        tracks: [
          {
            uri: songUri,
          },
        ],
      },
    }
  );
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { snapshotId: response.data.snapshot_id };
  }
};

export const getPlaylist = async (playlistId: string, accessToken: string) => {
  const response = await axiosInstance.get(
    `v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { playlist: response.data };
  }
};

export const searchSong = async (query: string, accessToken: string) => {
  const response = await axiosInstance.get(`v1/search?q=${query}&type=track`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.data.error) {
    return { error: response.data.error };
  } else {
    return { songs: response.data.tracks.items };
  }
};
