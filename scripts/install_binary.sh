#!/bin/sh

# Configuration

RELEASE_URL=https://api.github.com/repos/s21toolkit/s21cli/releases/latest

S21_ROOT="$HOME/.s21"
S21_BIN="$S21_ROOT/bin"
S21_EXE="$S21_BIN/s21"

# Installation

echo "Installing s21cli"

PLATFORM=$(uname --kernel-name | tr '[:upper:]' '[:lower:]')
ARCHITECTURE=$(uname --machine | tr '[:upper:]' '[:lower:]')

echo "- Target platform identified as $PLATFORM/$ARCHITECTURE"

echo "- Locating latest release"

BINARY_URL=$(curl -s https://api.github.com/repos/s21toolkit/s21cli/releases/latest | grep "browser_download_url.*s21" | cut -d : -f 2,3 | tr -d \" | grep $PLATFORM | xargs)

if [ $BINARY_URL != *s21-$PLATFORM-$ARCHITECTURE ]; then
	echo "-- Warning: Platform architecture checks are not yet fully implemented"
	echo "-- Warning: Potential architecture mismatch detected for $BINARY_URL -> $ARCHITECTURE"
fi

echo "- Downloading $BINARY_URL to $S21_BIN"

mkdir -p $S21_BIN
curl -L $BINARY_URL -o $S21_EXE

echo "- Updating permissions"

chmod +x $S21_EXE

echo "- Adding to PATH"

if echo :$PATH: | grep -qv :$S21_BIN:; then

	added=false

	# Posix

	if [ -f "$HOME/.profile" ]; then
		echo 'export PATH="$HOME/.s21/bin:$PATH"' >> "$HOME/.profile"

		added=true
		echo "-- Added to .profile"
	fi

	# Bash

	if [ -f "$HOME/.bashrc" ]; then
		echo 'export PATH="$HOME/.s21/bin:$PATH"' >> "$HOME/.bashrc"

		echo "-- Added to .bashrc"
	elif [ -f "$HOME/.bash_profile" ]; then
		echo 'export PATH="$HOME/.s21/bin:$PATH"' >> "$HOME/.bash_profile"

		added=true
		echo "-- Added to .bash_profile"
	fi

	# Zsh

	if [ -f "$HOME/.zprofile" ]; then
		echo 'export PATH="$HOME/.s21/bin:$PATH"' >> "$HOME/.zprofile"

		echo "-- Added to .zprofile"
	elif [ -f "$HOME/.zshrc" ]; then
		echo 'export PATH="$HOME/.s21/bin:$PATH"' >> "$HOME/.zshrc"

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
