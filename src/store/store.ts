import {
  AnyAction,
  Reducer,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { PersistConfig, persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/es/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";

// import reducers and slice key
import { userDetailsReducer } from "./modules/user-details";
import { userRolesReducer } from "./modules/user-roles";
import { USER_ROLES_KEY, USER_DETAILS_KEY } from "./tools/constants";
import { KEY_ENCRYPT_STORE } from "./tools/constants";
import { RootState } from "./tools/types";

// persist key
const KEY_PERSIST_CONFIG = "root";

// persist config
const persistConfig: PersistConfig<RootState> = {
  key: KEY_PERSIST_CONFIG,
  storage,
  blacklist: [],
  writeFailHandler: (error) => console.log("storage error: ", error),
  transforms: [
    encryptTransform({
      secretKey: KEY_ENCRYPT_STORE,
      onError: function (error) {
        // Handle the error.
        console.log(`error transform encrypted store `, error);
      },
    }),
  ],
};

// combine all reducers
export const reducer = combineReducers({
  // add reducers and slice key as  [key] : reducer
  [USER_ROLES_KEY]: userRolesReducer,
  [USER_DETAILS_KEY]: userDetailsReducer,
});

// root reducer
const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  // if action is clear state then clear browser store else return reducer state
  if (action.type === `clearState`) {
    storage.removeItem(`persist:${KEY_PERSIST_CONFIG}`);
    state = {} as RootState;
  }
  return reducer(state, action);
};

// persist Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// create store
export const store = configureStore({
  reducer: persistedReducer,
  // Additional middleware can be passed to this array
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// create dispatch as AppDispatch
type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// create persistor object
export const persistor = persistStore(store);
