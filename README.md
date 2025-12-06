# Пуньк

Надоел мне Spotify, хочу скачать все свои плейлисты любимые, но во FLAC, в этом мне поможет Spotify API, Jackett и Transmission.

Для работы Spotify API нужен client_id, client_secret, вот инструкция, как их получить:

https://developer.spotify.com/documentation/web-api/tutorials/getting-started.

## Jackett
После первого запуска контейнера надо открыть его взять ключ API, и настроить индексы, они попадают в папку /data/jackett поэтому это одноразовая инициатива

В каждом отдельном индексе есть категории и можно фильтровать по категориям

Я пока добавил только рутрекер org и там есть категории с названиями hi-res, lossless, lossy 

lossy это 320 mp3

Находит много всякого лишнего