import { User } from "../entity/User";

import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

// Authenticate User using JWT Token
export const verifyToken = (passport) => {
  const options: any = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = "secret";
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.createQueryBuilder("user")
          .where("user.id = :id", { id: payload.id })
          .getOne();
        // user found
        if (!user) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        console.error("Error:", err);
        return done(err, false);
      }
    })
  );
};

export const verifyHost = (passport) => {
  const options: any = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = "secret";
  passport.use(
    "host",
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.createQueryBuilder("user")
          .leftJoinAndSelect("user.group", "group")
          .where("user.id = :id", { id: payload.id })
          .getOne();
        // user found
        if (!user || !user.group || user.group.hostId !== user.id) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        console.error("Error:", err);
        return done(err, false);
      }
    })
  );
};

export const verifyMember = (passport) => {
  const options: any = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = "secret";
  passport.use(
    "member",
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.createQueryBuilder("user")
          .leftJoinAndSelect("user.group", "group")
          .where("user.id = :id", { id: payload.id })
          .getOne();
        // user found
        if (!user || !user.group) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        console.error("Error:", err);
        return done(err, false);
      }
    })
  );
};
