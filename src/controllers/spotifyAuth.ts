import express, { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import axiosInstance from "../config/axios";
import { User } from "../entity/User";
import { redis } from "../config/redis";
import { requestResponse } from "../types";

export const spotifyAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    const { codeVerifier, code } = req.body;
    let body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "myapp://auth-callback",
      client_id: process.env.CLIENT_ID as string,
      code_verifier: codeVerifier,
    });
    const response = await axiosInstance.post("api/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.data.error) {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      const expires_in = response.data.expires_in; // TODO
      if (accessToken && refreshToken) {
        const response = await isPremium(accessToken); // TODO change variable to make less confusing
        if (!response.success) {
          return res.status(404).json(response);
        }
        // keep the tokens ()
        // access token in redis - access_token:userId: [access token]
        await redis.set("access_token:" + user.id, accessToken, "EX", 60 * 60);
        // refresh token in user DB doc
        user.refreshToken = refreshToken;

        // get user's spotify User Id
        const spotifyUser = await axiosInstance.get("v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        user.spotifyId = spotifyUser.data.id;

        await user.save();

        return res.status(200).json(response);
      }
    }
    return res.status(404).json({ error: "User not found" });
  }
);

export const getPremiumStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const accessToken = req.accessToken as string;
    const response = await isPremium(accessToken);
    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(404).json(response);
    }
  }
);

const isPremium = async (accessToken: string): Promise<requestResponse> => {
  const res = await axiosInstance.get("v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (res.data.product) {
    if (res.data.product === "premium") {
      return { success: true };
    } else {
      return { error: "User does not Have premium" };
    }
  } else {
    return { error: "User not found" };
  }
};

const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  let body = new URLSearchParams({
    grant_type: "authorization_code",
    refresh_token: refreshToken,
    client_id: process.env.CLIENT_ID as string,
  });
  const response = await axiosInstance.get("api/token", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const accessToken = response.data.access_token;
  if (accessToken) {
    return accessToken;
  } else {
    return "error";
  }
};

// Access Token middleware
// Adds accessToken to req
export const getAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    let accessToken = await redis.get("access_token:" + user.id);
    if (!accessToken) {
      accessToken = await refreshAccessToken(user.refreshToken);
      if (accessToken == "error") {
        return res
          .status(404)
          .json({ error: "Refreshing spotify token failed" });
      }
      await redis.set("access_token:" + user.id, accessToken, "EX", 60 * 60);
    }
    req.accessToken = accessToken as string;
  }
);
