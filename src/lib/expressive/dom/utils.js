export const on = addEventListener

export const navigateTo = pathname => history.pushState({}, '', pathname)

export const { pathname } = location
