import {
    CRUD_SHOW_INIT, CRUD_SHOW, CRUD_SHOW_ERROR, CRUD_SAVE_INIT,
    CRUD_SAVE, CRUD_SAVE_ERROR, CRUD_EDIT_INIT, CRUD_EDIT,
    CRUD_EDIT_ERROR, CRUD_DROP_INIT, CRUD_DROP, CRUD_DROP_ERROR,
    CRUD_ON_MODAL, CRUD_ON_BTN_TITLE, CRUD_ON_ROWID,
} from "./../../types";

export default (state, action) => {

    switch (action.type) {
        case CRUD_SHOW_INIT:
        case CRUD_SAVE_INIT:
        case CRUD_EDIT_INIT:
        case CRUD_DROP_INIT:
            return {
                ...state,
                loading: true,
            };
        case CRUD_SHOW_ERROR:
        case CRUD_SAVE_ERROR:
        case CRUD_EDIT_ERROR:
        case CRUD_DROP_ERROR:
            return {
                ...state,
                datasource: [],
                loading: false,
                error: true,
            };
        case CRUD_SHOW:
            return {
                ...state,
                datasource: action.payload,
                loading: false,
                error: false,
            };
        case CRUD_SAVE:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case CRUD_EDIT:
            return {
                ...state,
                loading: true,
                error: false,
            };
        case CRUD_ON_MODAL:
            return {
                ...state,
                openmodal: action.payload,
            };
        case CRUD_ON_BTN_TITLE:
            return {
                ...state,
                btntitle: action.payload,
            };
        case CRUD_ON_ROWID:
            return {
                ...state,
                currentrowid: action.payload,
            };

        case "CRUD_LOADING":
            return {
                ...state,
                loading: action.payload,
            };

        case "CRUD_DATASOURCE":
            return {
                ...state,
                datasource: action.payload,
            };

        default:
            return state;
    }
};