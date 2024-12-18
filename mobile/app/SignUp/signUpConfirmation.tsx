import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { api } from "../../service/api";
import Checkbox from "expo-checkbox";
import Button from "../../components/FormComponents/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { AuthContext } from "../../context/AuthContext";
import ErrorModal from "@/components/ErrorModal";
import { useNavigation } from "@react-navigation/native";

import pastaImage from "../../assets/images/pasta.jpeg";
import pizzaImage from "../../assets/images/pizza.jpg";
import hamburgerImage from "../../assets/images/hamburger.jpg";
import sushiImage from "../../assets/images/sushi.jpg";
import iceCreamImage from "../../assets/images/iceCream.jpeg";
import coffeeImage from "../../assets/images/coffee.png";
import beerImage from "../../assets/images/beer.jpg";
import glutenFreeImage from "../../assets/images/glutenFree.jpg";
import bbqImage from "../../assets/images/bbq.jpg";
import veganImage from "../../assets/images/vegan.jpeg";
import vegetarianImage from "../../assets/images/vegetarian.jpg";
import fitImage from "../../assets/images/fit.jpg";
import fastFoodImage from "../../assets/images/fastFood.jpg";
import dessertImage from "../../assets/images/dessert.jpg";

const imageMap: { [key: string]: any } = {
  pasta: pastaImage,
  pizza: pizzaImage,
  hamburger: hamburgerImage,
  sushi: sushiImage,
  iceCream: iceCreamImage,
  coffee: coffeeImage,
  beer: beerImage,
  glutenFree: glutenFreeImage,
  bbq: bbqImage,
  vegan: veganImage,
  vegetarian: vegetarianImage,
  fit: fitImage,
  fastFood: fastFoodImage,
  dessert: dessertImage,
};

interface confirmationData {
  userName: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  birthDate: Date;
  useTerms: boolean;
}

export default function SignUpConfirmation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tastes, setTastes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setUserLogin } = useContext(AuthContext);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const queryParams = useLocalSearchParams();

  const data = {
    ...queryParams,
    birthDate: new Date(queryParams.birthDate as string),
    useTerms: queryParams.useTerms === "Accepted",
  } as confirmationData;

  const onSubmit = async (data: confirmationData) => {
    try {
      const response = await api({
        method: "POST",
        url: "users/",
        data: {
          ...data,
          tastes: tastes,
        },
      });

      setUserLogin(response.data.user);
      return response;
    } catch (error: any) {
      setShowErrorModal(true);
      console.error("Error:", error.response);
      setError(error.response.data.error);
    }
  };

  const tastesToSelect = [
    { id: "pasta", title: "Massas" },
    { id: "pizza", title: "Pizza" },
    { id: "hamburger", title: "Hamburguer" },
    { id: "sushi", title: "Sushi" },
    { id: "iceCream", title: "Sorvete" },
    { id: "coffee", title: "Café" },
    { id: "beer", title: "Cerveja" },
    { id: "glutenFree", title: "Sem Glúten" },
    { id: "bbq", title: "Churrasco" },
    { id: "vegan", title: "Vegano" },
    { id: "vegetarian", title: "Vegetariano" },
    { id: "fit", title: "Fit" },
    { id: "fastFood", title: "Fast Food" },
    { id: "dessert", title: "Sobremesa" },
  ];

  return (
    <SafeAreaView>
      <ScrollView style={{ marginBottom: 60 }}>
        <View style={styles.container}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            Selecione seus interesses
          </Text>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {tastesToSelect.map((taste, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={index}
                style={{ marginBottom: 20, overflow: "hidden" }}
                onPress={() => {
                  if (tastes.includes(taste.id)) {
                    setTastes(tastes.filter((t) => t !== taste.id));
                  } else {
                    setTastes([...tastes, taste.id]);
                  }
                }}
              >
                <View>
                  <Image
                    source={imageMap[taste.id]}
                    style={styles.image}
                    blurRadius={2}
                  />
                  {tastes.includes(taste.id) && (
                    <Checkbox
                      value={tastes.includes(taste.id)}
                      color={Colors.red.brand}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 118,
                        borderRadius: 10,
                      }}
                    />
                  )}
                  <View
                    style={{
                      position: "absolute",
                      top: 115,
                      left: 10,
                      borderRadius: 10,
                      padding: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "900",
                        fontSize: 18,
                      }}
                    >
                      {taste.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          backgroundColor: "white",
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "15%",
          borderTopColor: Colors.red.brand,
          borderWidth: 1,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: "black",
            marginLeft: 10,
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          Interesses selecionados: {tastes.length > 0 ? tastes.length : "0"}
        </Text>
        <Button
          title="Finalizar"
          color={tastes.length < 5 ? "secondary" : "primary"}
          onClick={async () => {
            setIsLoading(true);
            await onSubmit(data);
            router.push("/");
            setIsLoading(false);
          }}
          disabled={tastes.length < 5}
          isLoading={isLoading}
          style={{ margin: 10, width: 100, marginBottom: 20 }}
        />
      </View>
      {showErrorModal && (
        <ErrorModal
          isVisible={showErrorModal}
          message={'Erro ao criar usuário: "' + error + '"'}
          onClose={() => {
            setShowErrorModal(false);
            router.back();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 400,
    height: 150,
    marginBottom: 10,
  },
  container: {
    padding: 16,
    margin: 10,
    marginTop: 30,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: 250,
    padding: 8,
  },
  image: {
    borderRadius: 10,
    width: 150,
    height: 150,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
