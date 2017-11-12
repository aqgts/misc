import "babel-polyfill";
import lodash from "lodash";
import {TextEncoder, TextDecoder} from "text-encoding";
import math from "mathjs";

global._ = lodash;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.math = math;
