import { featured, genre } from "./featured.mjs";
import { theme, style } from "./theme.mjs";
import { region, order } from "./region.mjs";
import { awards, critics } from "./awards.mjs";
import { director, actor } from "./people.mjs";

export const lists = [...featured, ...genre, ...theme, ...style, ...region, ...order, ...awards, ...critics, ...director, ...actor];
