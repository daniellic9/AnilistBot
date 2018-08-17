import { MediaType } from '..';
import { I18n } from 'telegraf-i18n';
import { fetchData } from 'endeavor';
import animeGenres from '../queries/callback/genres/anime.gql';
import mangaGenres from '../queries/callback/genres/manga.gql';
import animeDescription from '../queries/callback/description/anime.gql';
import mangaDescription from '../queries/callback/description/manga.gql';
import { CallbackDescription, CallbackGenres } from '../queries/callback';
import translate from 'translate';
import { config } from 'dotenv';

config();

translate.key = process.env.GOOGLE_KEY;

export type CallbackFiled = 'list' |
                            'genres' |
                            'description' 

interface CallbackContext {
    readonly id: number;
    readonly type: MediaType;
    readonly translation: I18n;
    readonly field: CallbackFiled;
}

interface DataContext {
    readonly id: number;
    readonly type: MediaType;
    readonly translation: I18n;
}

interface TranslateContext {
    readonly translation: I18n;
    readonly message: string | Array<string>;
}

const displayLimit = 120;

const translateData = async ({ message, translation }: TranslateContext): Promise<string> => {
    const to = translation.locale().split('-')[0];
    const text = await translate(message, { from: 'en', to });

    return text.slice(0, 120);
};

const fetchDescription = async ({ id, type, translation }: DataContext): Promise<string> => {
    const fetch = <CallbackDescription> await fetchData({
        query: ('ANIME' === type) ? animeDescription : mangaDescription,
        variables: { id }
    });
    const message = fetch.data.Media.description;

    if (translation.locale().includes('en')) {
        return message.slice(0, displayLimit);
    }

    return await translateData({ message, translation });
};

const fetchGenres = async ({ id, type, translation }: DataContext): Promise<string> => {
    const fetch = <CallbackGenres> await fetchData({
        query: ('ANIME' === type) ? animeGenres : mangaGenres,
        variables: { id }
    });
    const message = fetch.data.Media.genres;

    if (translation.locale().includes('en')) {
        return message.join('\n*');
    }

    return await translateData({ message, translation });
};

export const handleCallback = async ({ id, type, field, translation }: CallbackContext): Promise<string> => {
    if ('description' === field) {
        return fetchDescription({ id, type, translation });
    } if ('genres' === field) {
        return fetchGenres({ id, type, translation });
    }

    return 'Not working yet -- não funcionando ainda';
};
