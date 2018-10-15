module.exports = {
  accountName: username => {
    // Return false if username value is falsy
    if (!username) return false
    // Return an array if username(s) not in array.
    else if (!Array.isArray(username)) username = [username] // Create an array
    return !username.some(
      value =>
        value.length < 3 || // Username is less than 3
        value.length > 16 || // Username is more  than 16
        /**
         * Regular Expression:
         *  Alphabet, Numbers, Dash, Dot with different Capturing groups and Non-Capturing group.
         *  Each segment must begin with a letter (a-z, English alphabet) and end with a letter or a number (0-9)
         *  Hyphens (-) must be accompanied side by side by letters or numbers
         *  no double hyphens. Hyphens can't be at the beginning or end of a segment either because of rule 3
         */
        !/^[a-z](-[a-z0-9](-[a-z0-9])*)?(-[a-z0-9]|[a-z0-9])*(?:\.[a-z](-[a-z0-9](-[a-z0-9])*)?(-[a-z0-9]|[a-z0-9])*)*$/.test(
          value
        )
    )
  }
}
