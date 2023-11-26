#!/bin/sh

# Configuration

RELEASES_URL="https://api.github.com/repos/s21toolkit/s21cli/releases"


# I FUCKING LOVE POSIX SHELLS
: "${S21_ROOT:="$HOME/.s21"}"			# Root directory
: "${S21_LINK:="$S21_ROOT/bin"}"		# Exposed directory
: "${S21_EXE:="$S21_LINK/s21"}"		# Executable path

S21_BIN=$(dirname $S21_EXE)

# Installation

echo "Installing s21cli"

PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCHITECTURE=$(uname -m | tr '[:upper:]' '[:lower:]')

echo "- Target platform identified as $PLATFORM/$ARCHITECTURE"

echo "- Locating latest release"

RELEASE=latest

if [ "$S21_INSTALL_UNSTABLE" = true ]; then
	latest_version=$(curl -s $RELEASES_URL | grep "browser_download_url.*s21" | grep -o "v.*/" | tr -d / | head -n 1)

	RELEASE=tags/$latest_version
fi

BINARY_URL=$(curl -s "$RELEASES_URL/$RELEASE" | grep "browser_download_url.*s21" | cut -d : -f 2,3 | tr -d \" | grep $PLATFORM | xargs)

if [ -z "$BINARY_URL" ]; then
	echo "-- Error: Failed to fetch release artifacts"

	echo "-- Error:" $(curl -s "$RELEASES_URL/$RELEASE")

	exit 1
fi

if [ "$BINARY_URL" != *s21-$PLATFORM-$ARCHITECTURE ]; then
	echo "-- Warning: Platform architecture checks are not yet fully implemented"
	echo "-- Warning: Potential architecture mismatch detected for $BINARY_URL -> $ARCHITECTURE"
fi

echo "- Downloading $BINARY_URL to $S21_BIN"

mkdir -p $S21_ROOT $S21_LINK $S21_BIN
curl -L $BINARY_URL -o $S21_EXE

echo "- Updating permissions"

chmod +x $S21_EXE

echo "- Adding to PATH"

if echo :$PATH: | grep -qv :$S21_LINK:; then

	added=false

	# Posix

	if [ -f "$HOME/.profile" ]; then
		echo 'export PATH="'$S21_LINK':$PATH"' >> "$HOME/.profile"

		added=true
		echo "-- Added to .profile"
	fi

	# Bash

	if [ -f "$HOME/.bashrc" ]; then
		echo 'export PATH="'$S21_LINK':$PATH"' >> "$HOME/.bashrc"

		echo "-- Added to .bashrc"
	elif [ -f "$HOME/.bash_profile" ]; then
		echo 'export PATH="'$S21_LINK':$PATH"' >> "$HOME/.bash_profile"

		added=true
		echo "-- Added to .bash_profile"
	fi

	# Zsh

	if [ -f "$HOME/.zprofile" ]; then
		echo 'export PATH="'$S21_LINK':$PATH"' >> "$HOME/.zprofile"

		echo "-- Added to .zprofile"
	elif [ -f "$HOME/.zshrc" ]; then
		echo 'export PATH="'$S21_LINK':$PATH"' >> "$HOME/.zshrc"

		added=true
		echo "-- Added to .zshrc"
	fi

	if [ $added = true ]; then
		echo "-- Restart your terminal or source confiugration files to apply changes"
	else
		echo "-- Failed to detect supported configuration files, add manually if needed"
	fi

else
	echo "-- Already added"
fi

echo "Complete"
